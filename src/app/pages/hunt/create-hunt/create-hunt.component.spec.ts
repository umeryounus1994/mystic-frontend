import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateHuntComponent } from './create-hunt.component';

describe('CreateHuntComponent', () => {
  let component: CreateHuntComponent;
  let fixture: ComponentFixture<CreateHuntComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateHuntComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateHuntComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
