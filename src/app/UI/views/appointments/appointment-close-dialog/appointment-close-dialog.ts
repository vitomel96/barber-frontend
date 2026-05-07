import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-appointment-close-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './appointment-close-dialog.html',
  styleUrl: './appointment-close-dialog.scss'
})
export class AppointmentCloseDialogComponent implements OnInit {
  form!: FormGroup;
  paymentMethods = ['EFECTIVO', 'NEQUI', 'DAVIPLATA', 'TARJETA', 'TRANSFERENCIA'];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AppointmentCloseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      payment_method: ['', Validators.required],
      tip: [0, [Validators.min(0)]]
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  save(): void {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.value);
  }
}

