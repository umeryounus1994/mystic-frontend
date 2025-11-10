import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListActivityDropsComponent } from './list-activity-drops.component';

describe('ListActivityDropsComponent', () => {
  let component: ListActivityDropsComponent;
  let fixture: ComponentFixture<ListActivityDropsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListActivityDropsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListActivityDropsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
