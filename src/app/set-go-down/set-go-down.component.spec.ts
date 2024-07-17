import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetGoDownComponent } from './set-go-down.component';

describe('SetGoDownComponent', () => {
  let component: SetGoDownComponent;
  let fixture: ComponentFixture<SetGoDownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetGoDownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SetGoDownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
