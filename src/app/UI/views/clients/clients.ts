import { CommonModule, NgClass } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Subject, takeUntil } from 'rxjs';

import { Client } from '../../../domain/models/Client/Client';
import { ClientUseCase } from '../../../domain/models/Client/usecase/clientusecase';
import { ClientFormComponent } from './client-form/client-form';
import { ClientHistoryDialog } from './client-history-dialog/client-history-dialog';
import { AppointmentsDialogComponent } from '../appointments/appointments-dialog/appointments-dialog';

import {
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [
    NgClass,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './clients.html',
  styleUrl: './clients.scss',
})
export class Clients implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  dataSource = new MatTableDataSource<Client>([]);

  isLoading = false;
  errorMessage = '';

  // MÉTRICAS
  totalClientes = 0;
  nuevosEsteMes = 0;
  clientesActivos = 0;

  // BUSCADOR
  searchText: string = '';
  filteredClients: Client[] = [];

  constructor(
    private clientUseCase: ClientUseCase,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.clientUseCase
      .getAllClients()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (clients) => {
          this.dataSource.data = clients;

          // listado inicial
          this.filteredClients = [...clients];

          // métricas
          this.calcularMetricas(clients);

          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error cargando clientes:', error);
          this.errorMessage = 'No se pudieron cargar los clientes';
          this.isLoading = false;
        }
      });
  }

  filtrarClientes(): void {
    const text = this.searchText.toLowerCase().trim();

    if (!text) {
      this.filteredClients = [...this.dataSource.data];
      return;
    }

    this.filteredClients = this.dataSource.data.filter((c: any) => {

      const nombreCompleto =
        `${c?.name || ''} ${c?.last_name || ''}`.toLowerCase();

      const phone = (c?.phone || '').toLowerCase();
      const email = (c?.email || '').toLowerCase();

      return (
        nombreCompleto.includes(text) ||
        phone.includes(text) ||
        email.includes(text)
      );
    });
  }

  calcularMetricas(clients: Client[]): void {
    this.totalClientes = clients.length;

    const now = new Date();

    // nuevos este mes
    this.nuevosEsteMes = clients.filter((c: any) => {
      if (!c.created_at) return false;

      const created = new Date(c.created_at);

      return (
        created.getMonth() === now.getMonth() &&
        created.getFullYear() === now.getFullYear()
      );
    }).length;

    // activos últimos 30 días
    this.clientesActivos = clients.filter((c: any) => {
      if (!c.last_visit) return false;

      const lastVisit = new Date(c.last_visit);

      const diff =
        (now.getTime() - lastVisit.getTime()) /
        (1000 * 60 * 60 * 24);

      return diff <= 30;
    }).length;
  }

  agregarCliente(): void {
    const dialogRef = this.dialog.open(ClientFormComponent, {
      width: '450px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadClients();
    });
  }

  editar(client: Client): void {
    const dialogRef = this.dialog.open(ClientFormComponent, {
      width: '450px',
      data: client
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadClients();
    });
  }

  openHistory(client: Client): void {
    this.dialog.open(ClientHistoryDialog, {
      width: '900px',
      maxHeight: '90vh',
      data: client
    });
  }

  openNewAppointment(client: Client): void {
    const ref = this.dialog.open(AppointmentsDialogComponent, {
      width: '700px',
      maxWidth: '95vw',
      data: { client }
    });

    ref.afterClosed().subscribe(saved => {
      if (saved) this.loadClients();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}