import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchActivitiesComponent } from './search-activities.component';

describe('SearchActivitiesComponent', () => {
  let component: SearchActivitiesComponent;
  let fixture: ComponentFixture<SearchActivitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchActivitiesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SearchActivitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
