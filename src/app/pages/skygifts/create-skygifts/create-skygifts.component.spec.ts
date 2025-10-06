import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSkygiftsComponent } from './create-skygifts.component';

describe('CreateSkygiftsComponent', () => {
  let component: CreateSkygiftsComponent;
  let fixture: ComponentFixture<CreateSkygiftsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateSkygiftsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateSkygiftsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
