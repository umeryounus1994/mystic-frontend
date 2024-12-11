import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListQuestGroupComponent } from './list-quest-group.component';

describe('ListQuestGroupComponent', () => {
  let component: ListQuestGroupComponent;
  let fixture: ComponentFixture<ListQuestGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListQuestGroupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListQuestGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
