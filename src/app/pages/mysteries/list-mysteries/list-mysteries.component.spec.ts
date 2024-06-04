import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListMysteriesComponent } from './list-mysteries.component';

describe('ListMysteriesComponent', () => {
  let component: ListMysteriesComponent;
  let fixture: ComponentFixture<ListMysteriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListMysteriesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListMysteriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
