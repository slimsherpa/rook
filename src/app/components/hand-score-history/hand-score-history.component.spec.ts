import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HandScoreHistoryComponent } from './hand-score-history.component';

describe('HandScoreHistoryComponent', () => {
  let component: HandScoreHistoryComponent;
  let fixture: ComponentFixture<HandScoreHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HandScoreHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HandScoreHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
