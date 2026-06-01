import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { Client } from '../../../../domain/models/Client/Client';
import { ClientUseCase } from '../../../../domain/models/Client/usecase/clientusecase';
import { FinanceUseCase } from '../../../../domain/models/Finance/usecase/financeusecase';

type ClientMode = 'ANONYMOUS' | 'EXISTING' | 'NEW';

@Component({
  selector: 'app-cash-register-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './cash-register-dialog.html',
  styleUrl: './cash-register-dialog.scss'
})
export class CashRegisterDialogComponent implements OnInit {
  form!: FormGroup;
  clients: Client[] = [];
  isLoading = false;
  errorMessage = '';
  paymentMethods = ['EFECTIVO', 'NEQUI', 'DAVIPLATA', 'TARJETA', 'TRANSFERENCIA'];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CashRegisterDialogComponent>,
    private clientUseCase: ClientUseCase,
    private financeUseCase: FinanceUseCase
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      description: ['Venta en caja', Validators.required],
      amount: [null, [Validators.required, Validators.min(1)]],
      payment_method: ['', Validators.required],
      date: [this.getLocalDateString(), Validators.required],
      notes: [''],
      client_mode: ['ANONYMOUS' as ClientMode, Validators.required],
      client_id: [''],
      client_name: [''],
      client_last_name: [''],
      client_phone: [''],
      client_email: ['', Validators.email]
    });

    this.form.get('client_mode')?.valueChanges.subscribe(() => {
      this.errorMessage = '';
      this.updateClientValidators();
    });
    this.updateClientValidators();

    this.clientUseCase.getAllClients().subscribe({
      next: (clients) => (this.clients = clients),
      error: () => (this.errorMessage = 'No fue posible cargar los clientes.')
    });
  }

  close(): void {
    this.dialogRef.close(false);
  }

  save(): void {
    this.updateClientValidators();
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    const payload: any = {
      description: value.description,
      amount: value.amount,
      payment_method: value.payment_method,
      date: value.date,
      notes: value.notes,
      is_anonymous: value.client_mode === 'ANONYMOUS'
    };

    if (value.client_mode === 'EXISTING') {
      payload.client_id = value.client_id;
    }

    if (value.client_mode === 'NEW') {
      payload.new_client = {
        name: value.client_name,
        last_name: value.client_last_name,
        phone: value.client_phone,
        email: value.client_email
      };
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.financeUseCase.createCashRegisterSale(payload).subscribe({
      next: () => this.dialogRef.close(true),
      error: (error) => {
        this.errorMessage =
          error?.error?.message || 'No fue posible registrar el cobro.';
        this.isLoading = false;
      }
    });
  }

  private updateClientValidators(): void {
    const mode = this.form.get('client_mode')?.value as ClientMode;
    const existingClient = this.form.get('client_id');
    const newClientName = this.form.get('client_name');
    const newClientPhone = this.form.get('client_phone');

    existingClient?.clearValidators();
    newClientName?.clearValidators();
    newClientPhone?.clearValidators();

    if (mode === 'EXISTING') {
      existingClient?.setValidators(Validators.required);
    }

    if (mode === 'NEW') {
      newClientName?.setValidators(Validators.required);
      newClientPhone?.setValidators(Validators.required);
    }

    existingClient?.updateValueAndValidity();
    newClientName?.updateValueAndValidity();
    newClientPhone?.updateValueAndValidity();
  }

  private getLocalDateString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
