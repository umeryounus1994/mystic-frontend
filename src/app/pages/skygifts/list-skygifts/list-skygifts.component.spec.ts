import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListSkygiftsComponent } from './list-skygifts.component';

describe('ListSkygiftsComponent', () => {
  let component: ListSkygiftsComponent;
  let fixture: ComponentFixture<ListSkygiftsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListSkygiftsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListSkygiftsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
