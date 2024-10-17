import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialCalculatorsComponent } from './financial-calculators.component';

describe('FinancialCalculatorsComponent', () => {
  let component: FinancialCalculatorsComponent;
  let fixture: ComponentFixture<FinancialCalculatorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FinancialCalculatorsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinancialCalculatorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
