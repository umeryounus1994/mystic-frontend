import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateMysterybagComponent } from './create-mysterybag.component';

describe('CreateMysterybagComponent', () => {
  let component: CreateMysterybagComponent;
  let fixture: ComponentFixture<CreateMysterybagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateMysterybagComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateMysterybagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
