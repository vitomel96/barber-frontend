import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RewardUseCase } from '../../../../domain/models/Reward/usecase/rewardusecase';
import { MatIcon } from "@angular/material/icon";
import { MatProgressSpinner } from "@angular/material/progress-spinner";

@Component({
  selector: 'app-validate-redeem-dialog',
   imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIcon,
    MatProgressSpinner
],
  templateUrl: './validate-redeem-dialog.html',
  styleUrl: './validate-redeem-dialog.scss',
})
export class ValidateRedeemDialog {
 form!: FormGroup;
  constructor(
    private fb: FormBuilder,
    private rewardUseCase: RewardUseCase
  ) {}
result: any = null;
loading = false;

  ngOnInit(){
    this.form = this.fb.group({
    code: ['', Validators.required]
  });

  }
validate() {
  if (this.form.invalid) return;

  this.loading = true;
  this.result = null;

  this.rewardUseCase
    .validateHash(this.form.value.code!)
    .subscribe({
      next: (res: any) => {
        this.result = res;
        this.loading = false;
      },
      error: () => {
        this.result = {
          valid: false,
          message: 'Código no válido o ya fue usado'
        };
        this.loading = false;
      }
    });
}
}
