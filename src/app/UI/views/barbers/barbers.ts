import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Subject, takeUntil } from 'rxjs';

import { BarberUseCase } from '../../../domain/models/Barber/usecase/barberusecase';
import { Barber } from '../../../domain/models/Barber/barber';
import { BarberFormComponent } from './barber-form/barber-form';
import { AppointmentUseCase } from '../../../domain/models/Appointment/usecase/appointmentusecase';
import { AppointmentsDialogComponent } from '../appointments/appointments-dialog/appointments-dialog';
import { BarberAgendaDialog } from './barber-agenda-dialog/barber-agenda-dialog';

@Component({
  selector: 'app-barbers',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './barbers.html',
  styleUrl: './barbers.scss',
})
export class Barbers implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  displayedColumns = [
    'name',
    'schedule',
    'day_off',
    'is_active',
    'acciones'
  ];

  dataSource = new MatTableDataSource<Barber>([]);
  isLoading = false;
  errorMessage = '';

  constructor(
    private appointmentUseCase: AppointmentUseCase,
    private barberUseCase: BarberUseCase,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadBarbers();
  }
  verAgenda(barber:any){
  this.dialog.open(BarberAgendaDialog,{
    width:'900px',
    maxWidth:'95vw',
    data:{ barber }
  });
}

asignarCita(barber:any){
  this.dialog.open(AppointmentsDialogComponent,{
    width:'700px',
    data:{ barber }
  });
}
  loadBarbers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.barberUseCase
      .getAllBarbers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (barbers) => {
          this.dataSource.data = barbers;
          this.isLoading = false;
        },
        error: (error) => {
          console.error(error);
          this.errorMessage = 'No se pudieron cargar los barberos';
          this.isLoading = false;
        },
      });
  }

  agregarBarbero(): void {
    const dialogRef = this.dialog.open(BarberFormComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadBarbers();
    });
  }

  editar(barber: Barber): void {
    const dialogRef = this.dialog.open(BarberFormComponent, {
      width: '500px',
      data: barber
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadBarbers();
    });
  }

  toggleActive(barber: Barber): void {
    barber.is_active = !barber.is_active;
    this.barberUseCase.createOrUpdateBarber(barber).subscribe();
  }

  getDayName(day: number): string {
    const days = [
      'Domingo','Lunes','Martes','Miércoles',
      'Jueves','Viernes','Sábado'
    ];
    return days[day] ?? '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
