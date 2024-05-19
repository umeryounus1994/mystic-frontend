import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MythicasComponent } from './mythicas.component';

describe('MythicasComponent', () => {
  let component: MythicasComponent;
  let fixture: ComponentFixture<MythicasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MythicasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MythicasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
