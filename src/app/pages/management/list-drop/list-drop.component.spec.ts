import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListDropComponent } from './list-drop.component';

describe('ListDropComponent', () => {
  let component: ListDropComponent;
  let fixture: ComponentFixture<ListDropComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListDropComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListDropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
