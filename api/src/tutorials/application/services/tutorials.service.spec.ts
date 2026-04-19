import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { TutorialsService } from './tutorials.service';

describe('TutorialsService (unit)', () => {
  let service: TutorialsService;
  const prisma: any = {
    tutorial: {
      findUniqueOrThrow: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      aggregate: jest.fn(),
      create: jest.fn(),
    },
    section: {
      findUniqueOrThrow: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    sectionItem: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    lesson: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    quiz: {
      findFirst: jest.fn(),
    },
    tutorialStatus: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const feed: any = { addItem: jest.fn() };
  const activityService: any = { log: jest.fn() };
  const settingsService: any = { get: jest.fn() };
  const tutorialQueue: any = { add: jest.fn() };
  const recommendationService: any = { recommend: jest.fn() };
  const i18n: any = { t: jest.fn() };

  beforeEach(() => {
    jest.resetAllMocks();
    service = new TutorialsService(
      prisma,
      feed,
      activityService,
      settingsService,
      recommendationService,
      tutorialQueue,
      i18n,
    );
  });

  describe('getTutorialDetails', () => {
    it('returns draft for owner if published', async () => {
      const owner = { id: 'u1' } as any;
      const published = { id: 't1', authorId: 'u1', status: { type: 'published' } } as any;
      const draft = { id: 'd1', status: { type: 'unpublishedChanges' } } as any;
      prisma.tutorial.findUniqueOrThrow.mockResolvedValue(published);
      prisma.tutorial.findFirst.mockResolvedValue(draft);

      const res = await service.getTutorialDetails('t1', owner);
      expect(prisma.tutorial.findUniqueOrThrow).toHaveBeenCalled();
      expect(prisma.tutorial.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ status: { type: 'unpublishedChanges' } }) }),
      );
      expect(res).toBe(draft);
    });

    it('throws Forbidden for non-owner on non-published tutorial', async () => {
      prisma.tutorial.findUniqueOrThrow.mockResolvedValue({
        id: 't2',
        authorId: 'owner',
        status: { type: 'draft' },
      });
      await expect(service.getTutorialDetails('t2', { id: 'other' } as any)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('throws NotFoundException when tutorial does not exist', async () => {
      prisma.tutorial.findUniqueOrThrow.mockRejectedValue(new Error('No record was found'));
      await expect(service.getTutorialDetails('non-existent', { id: 'u1' } as any)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('reorderSectionItems', () => {
    it('accepts subset and resolves by stableKey (including id field) and normalizes positions', async () => {
      const user = { id: 'u1' } as any;

      // Section and tutorial ownership
      prisma.section.findUniqueOrThrow.mockResolvedValue({
        id: 's1',
        tutorialId: 't1',
        tutorial: { id: 't1', status: { type: 'draft' } },
        position: 0,
        stableKey: 'sec-key',
      });
      prisma.tutorial.findFirst.mockResolvedValue({ id: 't1', authorId: 'u1', status: { type: 'draft' } });

      // Existing items in section
      const existing = [
        { id: 'i1', stableKey: 'k1' },
        { id: 'i2', stableKey: 'k2' },
        { id: 'i3', stableKey: 'k3' },
      ];
      prisma.sectionItem.findMany.mockResolvedValue(existing);

      // Capture updates performed inside transaction
      const txSectionItemUpdate = jest.fn();
      const txTutorialUpdate = jest.fn();
      prisma.$transaction.mockImplementation(async (fn: any) =>
        fn({ sectionItem: { update: txSectionItemUpdate }, tutorial: { update: txTutorialUpdate } }),
      );

      // Provide subset payload: reorder k3 first, then k1; k2 should keep remaining slot
      const payload = [
        { id: 'k3', position: 0 }, // stableKey passed in id
        { stableKey: 'k1', position: 1 },
      ] as any;

      await service.reorderSectionItems('s1', user, payload);

      // Expect normalized order: i3 -> pos0, i1 -> pos1, i2 -> pos2
      expect(txSectionItemUpdate).toHaveBeenCalledTimes(3);
      expect(txSectionItemUpdate).toHaveBeenNthCalledWith(1, {
        where: { id: 'i3' },
        data: { position: 0 },
      });
      expect(txSectionItemUpdate).toHaveBeenNthCalledWith(2, {
        where: { id: 'i1' },
        data: { position: 1 },
      });
      expect(txSectionItemUpdate).toHaveBeenNthCalledWith(3, {
        where: { id: 'i2' },
        data: { position: 2 },
      });
      expect(txTutorialUpdate).toHaveBeenCalledWith({
        where: { id: 't1' },
        data: expect.objectContaining({ updatedAt: expect.any(Date) }),
      });
    });
  });
});
