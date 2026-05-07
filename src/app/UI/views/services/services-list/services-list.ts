import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

import { ServiceUseCase } from '../../../../domain/models/Service/usecase/serviceusecase';
import { ServiceDialogComponent } from '../service-dialog/service-dialog';

@Component({
  selector: 'app-services-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule
  ],
  templateUrl: './services-list.html',
  styleUrl: './services-list.scss',
})
export class ServicesListComponent implements OnInit {

  services: any[] = [];
  displayedColumns = ['name', 'duration', 'price', 'earning_points','actions'];

  constructor(
    private serviceUseCase: ServiceUseCase,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices() {
    this.serviceUseCase.getAllServices()
      .subscribe(res => {
        this.services = res.filter(s => s.is_active);
      });
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(ServiceDialogComponent, {
      width: '450px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadServices();
    });
  }

  openEditDialog(service: any) {
    const dialogRef = this.dialog.open(ServiceDialogComponent, {
      width: '450px',
      data: service
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadServices();
    });
  }

  delete(service: any) {
    this.serviceUseCase.deactivateService({
      ...service,
      is_active: false
    }).subscribe(() => this.loadServices());
  }
}