import { Test, TestingModule } from '@nestjs/testing';
import { SectionsController } from './sections.controller';
import { TutorialsService } from '@/tutorials/application/services/tutorials.service';

describe('SectionsController', () => {
  let controller: SectionsController;
  let service: jest.Mocked<TutorialsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SectionsController],
      providers: [
        {
          provide: TutorialsService,
          useValue: {
            addSection: jest.fn(),
            addLesson: jest.fn(),
            addQuiz: jest.fn(),
            changeSectionName: jest.fn(),
            reorderSections: jest.fn(),
            reorderSectionItems: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SectionsController>(SectionsController);
    service = module.get(TutorialsService);
  });

  it('should delegate addSection', async () => {
    const tutorialId = 't1';
    const user: any = { id: 'u1' };
    const section = { id: 's1' } as any;
    service.addSection.mockResolvedValue(section);
    const res = await controller.addSection(tutorialId, user);
    expect(service.addSection).toHaveBeenCalledWith(tutorialId, user);
    expect(res).toEqual({ section });
  });

  it('should delegate addLesson and return readingTime', async () => {
    const sectionId = 's1';
    const user: any = { id: 'u1' };
    const item: any = { id: 'i1', lesson: { id: 'l1', readingTime: { minutes: 3 } } };
    service.addLesson.mockResolvedValue(item);
    const res = await controller.addLesson(sectionId, user);
    expect(service.addLesson).toHaveBeenCalledWith(sectionId, user);
    expect(res).toEqual({ item, readingTime: item.lesson.readingTime });
  });

  it('should delegate addQuiz', async () => {
    const sectionId = 's1';
    const user: any = { id: 'u1' };
    const item: any = { id: 'qi1' };
    service.addQuiz.mockResolvedValue(item);
    const res = await controller.addQuiz(sectionId, user);
    expect(service.addQuiz).toHaveBeenCalledWith(sectionId, user);
    expect(res).toEqual({ item });
  });

  it('should delegate changeSectionName', async () => {
    const sectionId = 's1';
    const user: any = { id: 'u1' };
    const dto: any = { name: 'New name' };
    service.changeSectionName.mockResolvedValue({});
    const res = await controller.changeSectionName(sectionId, user, dto);
    expect(service.changeSectionName).toHaveBeenCalledWith(sectionId, user, dto);
    expect(res).toEqual({});
  });

  it('should delegate reorderSections', async () => {
    const tutorialId = 't1';
    const user: any = { id: 'u1' };
    service.reorderSections.mockResolvedValue({ updated: true } as any);
    const res = await controller.reorderSections(tutorialId, user, {
      items: [
        { id: 'a', position: 0 },
        { id: 'b', position: 1 },
      ],
    });
    expect(service.reorderSections).toHaveBeenCalledWith(tutorialId, user, [
      { id: 'a', position: 0 },
      { id: 'b', position: 1 },
    ]);
    expect(res).toEqual({ updated: true });
  });

  it('should delegate reorderItems', async () => {
    const sectionId = 's1';
    const user: any = { id: 'u1' };
    service.reorderSectionItems.mockResolvedValue({ updated: true } as any);
    const res = await controller.reorderItems(sectionId, user, {
      items: [
        { id: 'x', position: 1 },
        { id: 'y', position: 0 },
      ],
    });
    expect(service.reorderSectionItems).toHaveBeenCalledWith(sectionId, user, [
      { id: 'x', position: 1 },
      { id: 'y', position: 0 },
    ]);
    expect(res).toEqual({ updated: true });
  });
});
