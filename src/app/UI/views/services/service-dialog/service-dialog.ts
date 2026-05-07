import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { ServiceUseCase } from '../../../../domain/models/Service/usecase/serviceusecase';

@Component({
  selector: 'app-service-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './service-dialog.html'
})
export class ServiceDialogComponent implements OnInit {

  form!: FormGroup;
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private serviceUseCase: ServiceUseCase,
    private dialogRef: MatDialogRef<ServiceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {

    this.isEdit = !!this.data;

    this.form = this.fb.group({
      name: [this.data?.name || '', Validators.required],
      duration: [this.data?.duration || '', [Validators.required, Validators.min(5)]],
      price: [this.data?.price || '', [Validators.required, Validators.min(0)]],
      barber_commission_percent: [
        this.data?.barber_commission_percent ?? 0,
        [Validators.required, Validators.min(0), Validators.max(100)]
      ],
      earning_points: [this.data?.earning_points || '', [Validators.required, Validators.min(0)]]
    });
  }

  save() {

    if (this.form.invalid) return;

    const payload = {
      ...this.data,
      ...this.form.value
    };

    const request = this.isEdit
      ? this.serviceUseCase.createOrUpdateService(payload)
      : this.serviceUseCase.createOrUpdateService(payload);

    request.subscribe(() => {
      this.dialogRef.close(true);
    });
  }

  close() {
    this.dialogRef.close();
  }
}
