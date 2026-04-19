import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';

const ip = require('ip');
const geoip = require('geoip-lite');
const DeviceDetector = require('node-device-detector');

@Injectable()
export class AddLoginHistoryUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string, userAgent: string) {
    const geo = await geoip.lookup(ip.address());
    const detector = new DeviceDetector({
      clientIndexes: true,
      deviceIndexes: true,
      deviceAliasCode: false,
      deviceTrusted: false,
      deviceInfo: false,
      maxUserAgentSize: 500,
    });
    const result = detector.detect(userAgent);
    return this.prisma.loginHistory.create({
      data: {
        userId,
        loggedAt: new Date(),
        ip: ip.address(),
        geo: geo,
        os: result.os,
        client: result.client,
      },
    });
  }
}
