import { Test, TestingModule } from '@nestjs/testing';
import { SocialMediaLinkService } from './social-media-link.service';
import { SettingsService } from '@/settings/application/services/settings.service';
import { PrismaService } from '@/platform/application/services/prisma.service';

describe('SocialMediaLinkService', () => {
  let service: SocialMediaLinkService;
  let settingsService: any;
  let prismaService: any;

  beforeEach(async () => {
    settingsService = {
      findValueByName: jest.fn(),
    };
    prismaService = {
      socialMediaLink: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SocialMediaLinkService,
        { provide: SettingsService, useValue: settingsService },
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    service = module.get<SocialMediaLinkService>(SocialMediaLinkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return empty array when socialMediaLinks is null (fix verified)', async () => {
    settingsService.findValueByName.mockResolvedValue(null);

    const result = await service.findAllActive();
    expect(result).toEqual([]);
  });

  it('should return empty array when socialMediaLinks is an empty array', async () => {
    settingsService.findValueByName.mockResolvedValue([]);

    const result = await service.findAllActive();
    expect(result).toEqual([]);
  });

  it('should return combined social media links when socialMediaLinks is an array', async () => {
    const mockLinks = [
      { type: 'facebook', url: 'https://facebook.com/test' },
      { type: 'twitter', url: '  ' }, // Should be ignored because trim() is empty
    ];
    settingsService.findValueByName.mockResolvedValue(mockLinks);

    prismaService.socialMediaLink.findUnique.mockResolvedValue({
      id: '1',
      type: 'facebook',
      name: 'Facebook',
      iconUrl: 'fb-icon.png',
    });

    const result = await service.findAllActive();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: '1',
      type: 'facebook',
      name: 'Facebook',
      iconUrl: 'fb-icon.png',
      url: 'https://facebook.com/test',
    });
    expect(prismaService.socialMediaLink.findUnique).toHaveBeenCalledWith({
      where: { type: 'facebook' },
    });
  });
});
