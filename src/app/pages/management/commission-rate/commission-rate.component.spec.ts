import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxSpinnerService } from 'ngx-spinner';

import { CommissionRateComponent } from './commission-rate.component';

describe('CommissionRateComponent', () => {
  let component: CommissionRateComponent;
  let fixture: ComponentFixture<CommissionRateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RouterTestingModule],
      declarations: [CommissionRateComponent],
      providers: [
        { provide: NgxSpinnerService, useValue: { show: () => {}, hide: () => {} } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CommissionRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

