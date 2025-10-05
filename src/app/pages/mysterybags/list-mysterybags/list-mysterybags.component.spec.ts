import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListMysterybagsComponent } from './list-mysterybags.component';

describe('ListMysterybagsComponent', () => {
  let component: ListMysterybagsComponent;
  let fixture: ComponentFixture<ListMysterybagsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListMysterybagsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListMysterybagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
