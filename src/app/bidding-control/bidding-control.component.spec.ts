import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BiddingControlComponent } from './bidding-control.component';

describe('BiddingControlComponent', () => {
  let component: BiddingControlComponent;
  let fixture: ComponentFixture<BiddingControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BiddingControlComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BiddingControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
