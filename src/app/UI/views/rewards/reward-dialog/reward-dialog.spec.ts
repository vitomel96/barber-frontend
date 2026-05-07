import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RewardDialog } from './reward-dialog';

describe('RewardDialog', () => {
  let component: RewardDialog;
  let fixture: ComponentFixture<RewardDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RewardDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RewardDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
