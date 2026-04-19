import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialMediaLinksWidget } from './social-media-links.widget';

describe('SocialMediaLinksWidget', () => {
  let component: SocialMediaLinksWidget;
  let fixture: ComponentFixture<SocialMediaLinksWidget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocialMediaLinksWidget]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SocialMediaLinksWidget);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
