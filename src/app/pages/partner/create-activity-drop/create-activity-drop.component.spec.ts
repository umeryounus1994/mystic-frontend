import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateActivityDropComponent } from './create-activity-drop.component';

describe('CreateActivityDropComponent', () => {
  let component: CreateActivityDropComponent;
  let fixture: ComponentFixture<CreateActivityDropComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateActivityDropComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateActivityDropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
