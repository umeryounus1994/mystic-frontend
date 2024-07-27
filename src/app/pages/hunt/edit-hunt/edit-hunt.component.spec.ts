import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditHuntComponent } from './edit-hunt.component';

describe('EditHuntComponent', () => {
  let component: EditHuntComponent;
  let fixture: ComponentFixture<EditHuntComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditHuntComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditHuntComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
