import { AdminPublicationListService } from './admin-publication-list.service';

describe('AdminPublicationListService (unit)', () => {
  let service: AdminPublicationListService;
  const prisma: any = {
    publication: {
      findFirst: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
    publicationStatus: {
      findUnique: jest.fn(),
    },
    user: {
      update: jest.fn(),
    },
    channel: {
      update: jest.fn(),
    },
    topic: {
      update: jest.fn(),
    },
  };

  const feed: any = {
    onUnpublished: jest.fn(),
    onRemoved: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
    service = new AdminPublicationListService(prisma, feed);
  });

  describe('delete', () => {
    it('should NOT throw TypeError when publishedPublication is found but has no channel', async () => {
      const hash = 'some-hash';
      prisma.publication.findFirst.mockResolvedValue({
        id: 'pub-id',
        hash: hash,
        topics: [],
        author: { id: 'auth-id', publicationsCount: 10 },
        channel: null,
      });

      await service.delete(hash);

      expect(prisma.channel.update).not.toHaveBeenCalled();
      expect(prisma.user.update).toHaveBeenCalled();
    });

    it('should use hash in findFirst query', async () => {
        const hash = 'target-hash';
        prisma.publication.findFirst.mockResolvedValue(null);

        await service.delete(hash);

        expect(prisma.publication.findFirst).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    hash: hash
                })
            })
        );
    });
  });

  describe('unpublish', () => {
    it('should return early if publication is not found', async () => {
      prisma.publication.findFirst.mockResolvedValue(null);
      await service.unpublish('non-existent');
      expect(prisma.publication.updateMany).not.toHaveBeenCalled();
    });

    it('should update status and user publication count', async () => {
      const pub = { id: 'p1', authorId: 'u1' };
      prisma.publication.findFirst.mockResolvedValue(pub);
      prisma.publicationStatus.findUnique.mockResolvedValue({ id: 's-draft' });

      await service.unpublish('h1');

      expect(prisma.publication.updateMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { hash: 'h1' },
        data: { statusId: 's-draft' }
      }));
      expect(prisma.user.update).toHaveBeenCalled();
      expect(feed.onUnpublished).toHaveBeenCalled();
    });
  });
});
