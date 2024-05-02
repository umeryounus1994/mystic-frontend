import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListQuestComponent } from './list-quest.component';

describe('ListQuestComponent', () => {
  let component: ListQuestComponent;
  let fixture: ComponentFixture<ListQuestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListQuestComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListQuestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
