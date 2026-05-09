import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(this.config.get('GOOGLE_CLIENT_ID'));
  }

  async register(dto: RegisterDto) {
    // Check if email exists
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    // Hash password
    const hashed = await bcrypt.hash(dto.password, 12);
    const referralCode = uuidv4().slice(0, 8).toUpperCase();

    // Create user
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashed,
        phone: dto.phone,
        role: dto.role || 'CUSTOMER',
        referralCode,
      },
    });

    // Create loyalty wallet for customers
    if (user.role === 'CUSTOMER') {
      await this.prisma.loyaltyPoints.create({
        data: { userId: user.id, points: 0, lifetimePoints: 0 },
      });

      // Handle referral bonus
      if (dto.referralCode) {
        const referrer = await this.prisma.user.findFirst({
          where: { referralCode: dto.referralCode },
        });
        if (referrer) {
          await this.prisma.referral.create({
            data: {
              referrerId: referrer.id,
              refereeId: user.id,
              pointsAwarded: 100,
            },
          });
          // Award referrer 100 bonus points
          await this.prisma.loyaltyPoints.update({
            where: { userId: referrer.id },
            data: { points: { increment: 100 }, lifetimePoints: { increment: 100 } },
          });
        }
      }
    }

    // If registering as merchant, create merchant record
    if (user.role === 'MERCHANT' && dto.storeName) {
      await this.prisma.merchant.create({
        data: {
          storeName: dto.storeName,
          ownerId: user.id,
          address: dto.address,
        },
      });
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.password) throw new UnauthorizedException('Invalid credentials');

    const isValid = await bcrypt.compare(dto.password, user.password);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    if (!user.isActive) throw new UnauthorizedException('Account is deactivated');

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, ...tokens };
  }

  async googleLogin(token: string) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: this.config.get('GOOGLE_CLIENT_ID'),
      });
      const payload = ticket.getPayload();
      if (!payload) throw new BadRequestException('Invalid Google token');

      const { email, name, sub: googleId, picture } = payload;

      let user = await this.prisma.user.findUnique({
        where: { email },
        include: { loyaltyPoints: true, merchant: true },
      });

      if (!user) {
        // Create new user
        const referralCode = uuidv4().slice(0, 8).toUpperCase();
        user = await this.prisma.user.create({
          data: {
            name: name || 'Google User',
            email: email!,
            googleId,
            avatar: picture,
            role: 'CUSTOMER',
            referralCode,
          },
          include: { loyaltyPoints: true, merchant: true },
        });

        // Create loyalty wallet
        await this.prisma.loyaltyPoints.create({
          data: { userId: user.id, points: 0, lifetimePoints: 0 },
        });
      } else if (!user.googleId) {
        // Link Google ID if not already linked
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { googleId, avatar: user.avatar || picture },
          include: { loyaltyPoints: true, merchant: true },
        });
      }

      if (!user.isActive) throw new UnauthorizedException('Account is deactivated');

      const tokens = await this.generateTokens(user.id, user.email, user.role);
      const { password: _, ...userWithoutPassword } = user;
      return { user: userWithoutPassword, ...tokens };
    } catch (error) {
      console.error('Google login error:', error);
      throw new UnauthorizedException('Google authentication failed');
    }
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) throw new UnauthorizedException();
      return this.generateTokens(user.id, user.email, user.role);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    // Always return success to prevent email enumeration
    if (!user) return { message: 'If that email exists, a reset link has been sent.' };

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour

    await this.prisma.passwordReset.create({
      data: { token, userId: user.id, expiresAt },
    });

    // TODO: Send email with reset link
    // await this.mailerService.sendPasswordReset(user.email, token);
    console.log(`Password reset token for ${email}: ${token}`);

    return { message: 'If that email exists, a reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const reset = await this.prisma.passwordReset.findUnique({ where: { token } });
    if (!reset || reset.used || reset.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: reset.userId },
      data: { password: hashed },
    });

    await this.prisma.passwordReset.update({
      where: { token },
      data: { used: true },
    });

    return { message: 'Password reset successfully' };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        loyaltyPoints: true,
        merchant: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_EXPIRY') || '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRY') || '7d',
      }),
    ]);
    return { accessToken, refreshToken };
  }
}
