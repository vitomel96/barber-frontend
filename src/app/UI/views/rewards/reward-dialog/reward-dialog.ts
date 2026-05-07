import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Reward } from '../../../../domain/models/Reward/reward';
import { RewardUseCase } from '../../../../domain/models/Reward/usecase/rewardusecase';

@Component({
  selector: 'app-reward-dialog',
   imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './reward-dialog.html',
  styleUrl: './reward-dialog.scss',
})
export class RewardDialog {
 form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private rewardUseCase: RewardUseCase,
    private dialogRef: MatDialogRef<RewardDialog>,
    @Inject(MAT_DIALOG_DATA) public data: Reward
  ) {}

  ngOnInit() {

    this.form = this.fb.group({
      name: [this.data?.name || '', Validators.required],
      required_points: [
        this.data?.required_points || '',
        Validators.required
      ]
    });
  }

  save() {

    if (this.form.invalid) return;

    if (this.data) {
      this.rewardUseCase.update(this.data.id, this.form.value)
        .subscribe(() => this.dialogRef.close(true));
    } else {
      this.rewardUseCase.create(this.form.value)
        .subscribe(() => this.dialogRef.close(true));
    }
  }

  close() {
    this.dialogRef.close();
  }
}
