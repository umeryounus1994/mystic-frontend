import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullWidthComponent } from './full-width.component';

describe('FullWidthComponent', () => {
  let component: FullWidthComponent;
  let fixture: ComponentFixture<FullWidthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FullWidthComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FullWidthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
