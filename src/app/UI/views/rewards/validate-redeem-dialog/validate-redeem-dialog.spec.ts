import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidateRedeemDialog } from './validate-redeem-dialog';

describe('ValidateRedeemDialog', () => {
  let component: ValidateRedeemDialog;
  let fixture: ComponentFixture<ValidateRedeemDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidateRedeemDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValidateRedeemDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
