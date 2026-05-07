import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { BarberUseCase } from '../../../../domain/models/Barber/usecase/barberusecase';
import { Barber } from '../../../../domain/models/Barber/barber';


@Component({
  selector: 'app-barber-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSlideToggleModule
  ],
  templateUrl: './barber-form.html',
  styleUrl: './barber-form.scss'
})
export class BarberFormComponent implements OnInit {

  form!: FormGroup;
  isEditMode = false;
  isLoading = false;

  days = [
    { value: 0, label: 'Domingo' },
    { value: 1, label: 'Lunes' },
    { value: 2, label: 'Martes' },
    { value: 3, label: 'Miércoles' },
    { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' },
    { value: 6, label: 'Sábado' },
  ];

  constructor(
    private fb: FormBuilder,
    private barberUseCase: BarberUseCase,
    private dialogRef: MatDialogRef<BarberFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Barber | null
  ) {}

  ngOnInit(): void {
    this.isEditMode = !!this.data;

    this.form = this.fb.group({
      id: [this.data?.id || null],
      name: [this.data?.name || '', Validators.required],
      last_name: [this.data?.last_name || ''],
      phone: [this.data?.phone || '', Validators.required],
      email: [this.data?.email || '', Validators.email],
      start_time: [this.data?.start_time || '09:00', Validators.required],
      end_time: [this.data?.end_time || '18:00', Validators.required],
      day_off: [this.data?.day_off ?? 0, Validators.required],
      is_active: [this.data?.is_active ?? true]
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const barber: Barber = this.form.value;

    this.barberUseCase.createOrUpdateBarber(barber).subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
