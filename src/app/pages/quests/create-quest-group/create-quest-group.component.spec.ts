import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateQuestGroupComponent } from './create-quest-group.component';

describe('CreateQuestGroupComponent', () => {
  let component: CreateQuestGroupComponent;
  let fixture: ComponentFixture<CreateQuestGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateQuestGroupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateQuestGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
