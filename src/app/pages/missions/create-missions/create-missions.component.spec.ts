import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateMissionsComponent } from './create-missions.component';

describe('CreateMissionsComponent', () => {
  let component: CreateMissionsComponent;
  let fixture: ComponentFixture<CreateMissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateMissionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateMissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
