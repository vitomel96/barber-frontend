import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RewardAdmin } from './reward-admin';

describe('RewardAdmin', () => {
  let component: RewardAdmin;
  let fixture: ComponentFixture<RewardAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RewardAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RewardAdmin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
