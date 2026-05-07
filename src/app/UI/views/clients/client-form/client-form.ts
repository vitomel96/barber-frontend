import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ClientUseCase } from '../../../../domain/models/Client/usecase/clientusecase';
import { Client } from '../../../../domain/models/Client/Client';
import { MatNativeDateModule, MatOptionModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { BarberUseCase } from '../../../../domain/models/Barber/usecase/barberusecase';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatOptionModule,
    MatSelectModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './client-form.html',
  styleUrl: './client-form.scss'
})
export class ClientFormComponent implements OnInit {

  form!: FormGroup;
  isEditMode = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private clientUseCase: ClientUseCase,
    private barberUseCase: BarberUseCase, // 🔥 falta crear barber usecase
    private dialogRef: MatDialogRef<ClientFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Client | null
  ) {}
today = new Date();
clients: any[] = [];
barbers: any[] = [];
 ngOnInit(): void {
  this.isEditMode = !!this.data;

  this.form = this.fb.group({
    id: [this.data?.id || null],
    name: [this.data?.name || '', Validators.required],
    last_name: [this.data?.last_name || ''],
    phone: [this.data?.phone || '', Validators.required],
    email: [this.data?.email || '', Validators.email],
    points: [this.data?.points || 0],
    birth_date: [
      this.data?.birth_date ? new Date(this.data.birth_date) : null
    ],

    // 🔥 NUEVO
    source: [this.data?.source || '', Validators.required],
    
    referred_by_client_id: [
      this.data?.referred_by_client?.id || null
    ],

    referred_by_barber_id: [
      this.data?.referred_by_barber?.id || null
    ],
  });
  this.barberUseCase.getAllBarbers().subscribe((response: any) => {
    this.barbers = response;
  }
  );
this.clientUseCase.getAllClients().subscribe(clients => {
  this.clients = clients;

  if (this.data?.referred_by_client?.id) {
    this.form.patchValue({
      referred_by_client_id: this.data.referred_by_client.id
    });
  }
});
  this.initSourceLogic();
}
private initSourceLogic() {
  const sourceControl = this.form.get('source');

  sourceControl?.valueChanges.subscribe(source => {
    this.updateSourceValidators(source);
  });

  // 🔥 importante para modo edición
  this.updateSourceValidators(sourceControl?.value);
}
private updateSourceValidators(source: string) {
  const clientRef = this.form.get('referred_by_client_id');
  const barberRef = this.form.get('referred_by_barber_id');

  // limpiar valores
  clientRef?.reset();
  barberRef?.reset();

  // limpiar validadores
  clientRef?.clearValidators();
  barberRef?.clearValidators();

  // aplicar según source
  if (source === 'REFERIDO') {
    clientRef?.setValidators([Validators.required]);
  } else if (source === 'BARBERO') {
    barberRef?.setValidators([Validators.required]);
  }

  // actualizar estado
  clientRef?.updateValueAndValidity();
  barberRef?.updateValueAndValidity();
}
save(): void {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  this.isLoading = true;

  const formValue = this.form.value;

  const client: Client = {
    ...formValue,
    birth_date: formValue.birth_date
      ? formValue.birth_date.toISOString().split('T')[0]
      : null
  };

  this.clientUseCase.createOrUpdateClient(client).subscribe({
    next: () => this.dialogRef.close(true),
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
