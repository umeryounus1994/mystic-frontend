import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FamilyDashboardComponent } from './family-dashboard.component';

describe('FamilyDashboardComponent', () => {
  let component: FamilyDashboardComponent;
  let fixture: ComponentFixture<FamilyDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FamilyDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FamilyDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
