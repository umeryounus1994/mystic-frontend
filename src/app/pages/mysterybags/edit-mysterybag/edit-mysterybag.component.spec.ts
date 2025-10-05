import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditMysterybagComponent } from './edit-mysterybag.component';

describe('EditMysterybagComponent', () => {
  let component: EditMysterybagComponent;
  let fixture: ComponentFixture<EditMysterybagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditMysterybagComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditMysterybagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
