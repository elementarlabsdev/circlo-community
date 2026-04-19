import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XIntegrationComponent } from './x-integration.component';

describe('XIntegrationComponent', () => {
  let component: XIntegrationComponent;
  let fixture: ComponentFixture<XIntegrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [XIntegrationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
