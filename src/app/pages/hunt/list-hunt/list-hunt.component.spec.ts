import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListHuntComponent } from './list-hunt.component';

describe('ListHuntComponent', () => {
  let component: ListHuntComponent;
  let fixture: ComponentFixture<ListHuntComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListHuntComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListHuntComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
