import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMysteriesComponent } from './add-mysteries.component';

describe('AddMysteriesComponent', () => {
  let component: AddMysteriesComponent;
  let fixture: ComponentFixture<AddMysteriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMysteriesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddMysteriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
