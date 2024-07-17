import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrickHistoryComponent } from './trick-history.component';

describe('TrickHistoryComponent', () => {
  let component: TrickHistoryComponent;
  let fixture: ComponentFixture<TrickHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrickHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrickHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
