import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestmentsTimelineTrackerComponent } from './investments-timeline-tracker.component';

describe('InvestmentsTimelineTrackerComponent', () => {
  let component: InvestmentsTimelineTrackerComponent;
  let fixture: ComponentFixture<InvestmentsTimelineTrackerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvestmentsTimelineTrackerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvestmentsTimelineTrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
