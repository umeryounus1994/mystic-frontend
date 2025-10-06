import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSkygiftsComponent } from './edit-skygifts.component';

describe('EditSkygiftsComponent', () => {
  let component: EditSkygiftsComponent;
  let fixture: ComponentFixture<EditSkygiftsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditSkygiftsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditSkygiftsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
