import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User as PrismaUser } from '@prisma/client';
import { User } from '@/identity/domain/entities/user.entity';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { CreateUserDto } from '@/identity/application/dtos/create-user.dto';
import { FindUserByIdUseCase } from '@/identity/application/use-cases/find-user-by-id.use-case';
import { FindUserByUsernameUseCase } from '@/identity/application/use-cases/find-user-by-username.use-case';
import { FindUserByEmailUseCase } from '@/identity/application/use-cases/find-user-by-email.use-case';
import { SetUserPasswordUseCase } from '@/identity/application/use-cases/set-user-password.use-case';
import { CountUsersUseCase } from '@/identity/application/use-cases/count-users.use-case';
import { IsEmailTakenUseCase } from '@/identity/application/use-cases/is-email-taken.use-case';
import { IsUsernameTakenUseCase } from '@/identity/application/use-cases/is-username-taken.use-case';
import { GetCreatedTutorialsUseCase } from '@/identity/application/use-cases/get-created-tutorials.use-case';
import { AddLoginHistoryUseCase } from '@/identity/application/use-cases/add-login-history.use-case';
import { GetUserProfileUseCase } from '@/identity/application/use-cases/get-user-profile.use-case';
import { slugifyWithHash } from '@/common/infrastructure/utils/slugify';

const ip = require('ip');
const geoip = require('geoip-lite');
const DeviceDetector = require('node-device-detector');
const Twig = require('twig');

const DEFAULT_DASHBOARD_WIDGETS = [
  {
    id: '0',
    x: 0,
    y: 0,
    w: 3,
    h: 5,
    wMd: 6,
    resizable: false,
    type: 'publications',
    widget: {},
  },
  {
    id: '1',
    x: 3,
    y: 0,
    w: 3,
    h: 5,
    wMd: 6,
    resizable: false,
    type: 'followers',
    widget: {},
  },
  {
    id: '2',
    x: 6,
    y: 0,
    w: 3,
    h: 5,
    wMd: 6,
    resizable: false,
    type: 'reactions',
    widget: {},
  },
  {
    id: '3',
    x: 9,
    y: 0,
    w: 3,
    h: 5,
    wMd: 6,
    resizable: false,
    type: 'views',
    widget: {},
  },
  {
    id: '4',
    x: 0,
    y: 5,
    w: 4,
    h: 20,
    wMd: 12,
    resizable: true,
    type: 'latestPublications',
    widget: {},
  },
  {
    id: '5',
    x: 4,
    y: 10,
    w: 4,
    h: 20,
    wMd: 12,
    resizable: true,
    type: 'latestTutorials',
    widget: {},
  },
  {
    id: '6',
    x: 8,
    y: 5,
    w: 4,
    h: 20,
    wMd: 12,
    resizable: true,
    type: 'activity',
    widget: {},
  },
] as const;

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    // use-cases
    private readonly findUserById: FindUserByIdUseCase,
    private readonly findUserByUsername: FindUserByUsernameUseCase,
    private readonly findUserByEmail: FindUserByEmailUseCase,
    private readonly setUserPasswordUc: SetUserPasswordUseCase,
    private readonly countUsers: CountUsersUseCase,
    private readonly isEmailTakenUc: IsEmailTakenUseCase,
    private readonly isUsernameTakenUc: IsUsernameTakenUseCase,
    private readonly getCreatedTutorialsUc: GetCreatedTutorialsUseCase,
    private readonly addLoginHistoryUc: AddLoginHistoryUseCase,
    private readonly getUserProfileUc: GetUserProfileUseCase,
  ) {}

  async getCreatedTutorials(userId: string) {
    return this.getCreatedTutorialsUc.execute(userId);
  }

  async findOneById(id: string): Promise<User | null> {
    return this.findUserById.execute(id);
  }

  async findOneByUsername(username: string): Promise<User | null> {
    return this.findUserByUsername.execute(username);
  }

  async setUserPassword(userId: string, newPassword: string): Promise<void> {
    await this.setUserPasswordUc.execute(userId, newPassword);
  }

  count() {
    return this.countUsers.execute();
  }

  async isEmailTaken(email: string): Promise<boolean> {
    return this.isEmailTakenUc.execute(email);
  }

  async uniqueUsernameValidate(
    username: string,
    userId: string,
  ): Promise<boolean> {
    return this.isUsernameTakenUc.execute(username, userId);
  }

  getProfile(user: PrismaUser | User | null) {
    return this.getUserProfileUc.execute(user);
  }

  async create(
    registerDto: CreateUserDto,
    registrationProvider = 'email',
    sendVerificationEmail = true,
  ): Promise<PrismaUser> {
    const geo = await geoip.lookup(ip.address());
    const usersCount = await this.count();
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(registerDto.password, salt);

    let username = registerDto.username;
    if (username) {
      const isTaken = await this.isUsernameTakenUc.execute(username);
      if (isTaken) {
        username = `${username}-${Math.random().toString(36).substring(2, 7)}`;
      }
    } else {
      username = slugifyWithHash(registerDto.name, crypto.randomUUID());
    }

    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        username,
        name: registerDto.name,
        notificationsViewedAt: new Date(),
        createdAt: new Date(),
        commentsCount: 0,
        timezone: geo?.timezone || 'UTC+0',
        verified: usersCount === 0,
        registrationProvider,
        cookieSettings: {
          create: {},
        },
        securitySettings: {
          create: {},
        },
        notificationSettings: {
          create: {},
        },
        isSuperAdmin: usersCount === 0,
        role: {
          connect: {
            type: usersCount === 0 ? 'admin' : 'user',
          },
        },
      },
    });

    // Ensure dashboard layout is stored in dedicated UserDashboard model
    await this.prisma.userDashboard.upsert({
      where: { userId: user.id },
      create: { userId: user.id, layout: DEFAULT_DASHBOARD_WIDGETS as any },
      update: {},
    });

    return user;
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.findUserByEmail.execute(email);
  }

  async addLoginHistory(user: PrismaUser | User, userAgent: string) {
    return this.addLoginHistoryUc.execute(user.id, userAgent);
  }
}
