import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditMysteriesComponent } from './edit-mysteries.component';

describe('EditMysteriesComponent', () => {
  let component: EditMysteriesComponent;
  let fixture: ComponentFixture<EditMysteriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditMysteriesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditMysteriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
