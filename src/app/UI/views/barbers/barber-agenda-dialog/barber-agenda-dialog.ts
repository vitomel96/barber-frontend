import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { BarberUseCase } from '../../../../domain/models/Barber/usecase/barberusecase';
import { MatFormFieldControl, MatFormFieldModule } from "@angular/material/form-field";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { NgClass, NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from "@angular/material/icon";
import { TimeFormatPipe } from '../../../pipes/time-format.pipe';

@Component({
  selector: 'app-barber-agenda-dialog',
  imports: [FormsModule, ReactiveFormsModule, MatInputModule, NgFor, NgSwitch, NgSwitchCase, NgSwitchDefault, NgIf, NgClass, MatDialogModule, MatFormFieldModule, MatDatepickerModule, MatIconModule, TimeFormatPipe],
  templateUrl: './barber-agenda-dialog.html',
  styleUrl: './barber-agenda-dialog.scss',
})
export class BarberAgendaDialog {
  loading = false;

  selectedDate: Date = new Date();

  slots: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private barberUseCase: BarberUseCase
  ) {}

  ngOnInit(): void {
    this.loadSchedule();
  }

  goToday() {
    this.selectedDate = new Date();
    this.loadSchedule();
  }

  loadSchedule() {

    if (!this.data?.barber?.id) return;

    this.loading = true;

    this.barberUseCase
      .getSchedule(
        this.data.barber.id,
        this.formatDate(this.selectedDate)
      )
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (res:any) => {
          this.slots = res || [];
        },
        error: () => {
          this.slots = [];
        }
      });
  }

  formatDate(date: Date): string {

    const d = new Date(date);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');

    return `${year}-${month}-${day}`;
  }

  getSlotPriceLabel(slot: any): string {
    const rawPrice = slot?.price ?? slot?.cost;
    if (rawPrice == null || rawPrice === '') {
      return '';
    }

    const value = Number(rawPrice);
    if (Number.isNaN(value)) {
      return `${rawPrice}`;
    }

    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(value);
  }
}
