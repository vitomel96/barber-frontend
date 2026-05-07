import { Component } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Appointment } from '../../../../domain/models/Appointment/Appointment';
import { NgClass } from '@angular/common';
import { AppointmentUseCase } from '../../../../domain/models/Appointment/usecase/appointmentusecase';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { AppointmentDetail } from '../appointment-detail/appointment-detail';

@Component({
  selector: 'app-appointment-history',
  imports: [NgClass,    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule, ReactiveFormsModule, MatTableModule],
  templateUrl: './appointment-history.html',
  styleUrl: './appointment-history.scss',
})
export class AppointmentHistory {

  displayedColumns: string[] = ['date', 'patient', 'status'];
  dataSource = new MatTableDataSource<Appointment>([]);
  allAppointments: Appointment[] = [];

  filterForm!: FormGroup;

  constructor(private fb: FormBuilder, private dialog: MatDialog, private appoitmentUseCase: AppointmentUseCase) {
    this.filterForm = this.fb.group({
      startDate: [null],
      endDate: [null],
    });
  }
openDetail(appointment: any) {
  this.dialog.open(AppointmentDetail, {
    width: '500px',
    data: appointment
  });
}
  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments() {
      this. appoitmentUseCase.getAllAppointments().subscribe((response: any) => {
        this.allAppointments = response;
        this.dataSource.data = this.allAppointments;
      } )
  }

  applyFilter() {
    const { startDate, endDate } = this.filterForm.value;

    this.dataSource.data = this.allAppointments.filter(appt => {
      const apptDate = new Date(appt.date);

      if (startDate && apptDate < new Date(startDate)) return false;
      if (endDate && apptDate > new Date(endDate)) return false;

      return true;
    });
  }

  clearFilter() {
    this.filterForm.reset();
    this.dataSource.data = this.allAppointments;
  }
}
