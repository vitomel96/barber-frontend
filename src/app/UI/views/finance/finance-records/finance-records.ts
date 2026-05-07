import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { GenericFormModule } from '../../../../infraestructure/helpers/generic-form-module/generic-form.module';

import { FinanceUseCase } from '../../../../domain/models/Finance/usecase/financeusecase';
import { FinanceType } from '../../../../domain/models/Finance/FinanceType';
import { FinanceRecord } from '../../../../domain/models/Finance/FinanceRecord';

import { BarberUseCase } from '../../../../domain/models/Barber/usecase/barberusecase';

@Component({
  selector: 'app-finance-records',
  standalone: true,
  imports: [
    CommonModule,
    GenericFormModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './finance-records.html',
  styleUrl: './finance-records.scss'
})
export class FinanceRecordsComponent implements OnInit {
  viewType!: FinanceType;
  title = '';

  records: FinanceRecord[] = [];
  visibleRecords: FinanceRecord[] = [];
  totalIncome = 0;
  barbers: any[] = [];

  // âœ… FECHA REAL PARA CALENDARIO
  selectedDate: Date = new Date();
  selectedDayDate: Date = new Date();

  incomeRange: 'day' | 'week' | 'month' = 'day';
  selectedWeek = this.getWeekNumberByDay(this.selectedDate.getDate());
  weekOptions: Array<{ value: number; label: string }> = [];
  paymentMethods = ['EFECTIVO', 'NEQUI', 'DAVIPLATA', 'TARJETA', 'TRANSFERENCIA'];
  selectedInvoiceName = '';
  filteredCategorySuggestions: string[] = [];
  isInvoiceModalOpen = false;
  activeInvoiceName = '';
  activeInvoiceUrl = '';
  activeInvoiceSafeUrl: SafeResourceUrl | null = null;
  activeInvoiceType: 'image' | 'pdf' | 'other' = 'other';

  form: Partial<FinanceRecord> = this.createEmptyForm();

getPaymentDay(date:string){
   return new Date(date).getDate();
}

  constructor(
    private route: ActivatedRoute,
    private financeUseCase: FinanceUseCase,
    private barberUseCase: BarberUseCase,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.updateWeekOptions();
    this.setDefaultSelectedWeekFromSelectedDate();
    this.route.data.subscribe((data) => {
      this.viewType = data['financeType'] as FinanceType;
      this.title = data['title'] || 'Finanzas';

      this.form = this.createEmptyForm();

      this.loadRecords();
    });

    this.loadBarbers();
  }

  // âœ… FORMATO YYYY-MM PARA BACKEND
  get selectedMonth(): string {
    const year = this.selectedDate.getFullYear();
    const month = String(this.selectedDate.getMonth() + 1).padStart(2, '0');

    return `${year}-${month}`;
  }

  // âœ… CAMBIO DE MES
  onMonthChange(): void {
    this.updateWeekOptions();
    this.setDefaultSelectedWeekFromSelectedDate();
    this.ensureDayFilterInCurrentMonth();
    this.loadRecords();
  }

  onDayDateChange(date: Date | null): void {
    if (!date) return;
    this.selectedDayDate = new Date(date);
    this.recalculateVisibleRecords();
  }

  selectToday(): void {
    const today = new Date();
    const monthChanged =
      this.selectedDate.getFullYear() !== today.getFullYear() ||
      this.selectedDate.getMonth() !== today.getMonth();

    this.selectedDayDate = today;

    if (monthChanged) {
      this.selectedDate = new Date(today.getFullYear(), today.getMonth(), 1);
      this.onMonthChange();
      return;
    }

    this.recalculateVisibleRecords();
  }

loadRecords(): void {
  const month = this.selectedMonth;
  const shouldFallbackFixed = this.viewType === FinanceType.FIXED_EXPENSE;

  this.financeUseCase.getRecords(this.viewType, month).subscribe({
    next: (records) => {
      if (shouldFallbackFixed && records.length === 0) {
        this.financeUseCase.getRecords(this.viewType).subscribe({
          next: (fallbackRecords) => {
            this.records = fallbackRecords;
            this.updateFilteredCategorySuggestions();
            this.recalculateVisibleRecords();
          },
          error: (error) => console.error(error)
        });
        return;
      }

      this.records = records;
      this.updateFilteredCategorySuggestions();
      this.recalculateVisibleRecords();
    },
    error: (error) => console.error(error)
  });
}

  loadBarbers(): void {
    this.barberUseCase.getAllBarbers().subscribe({
      next: (barbers) => {
        this.barbers = barbers.filter((barber) => barber.is_active);
      },
      error: (error) => console.error(error)
    });
  }

save(): void {
  if (!this.form.description || !this.form.amount || !this.form.date) {
    return;
  }

  let date = this.form.date;

  if (this.viewType === FinanceType.FIXED_EXPENSE) {
    const day = String(this.form.date).padStart(2, '0');
    date = `2000-01-${day}`;
  }

  const payload: Partial<FinanceRecord> = {
    ...this.form,
    type: this.viewType,
    date
  };

  const request = payload.id
    ? this.financeUseCase.updateRecord(payload.id, payload)
    : this.financeUseCase.createRecord(payload);

  request.subscribe({
    next: () => {
      this.form = this.createEmptyForm();
      this.selectedInvoiceName = '';
      this.loadRecords();
    },
    error: (error) => console.error(error)
  });
}
  edit(record: FinanceRecord): void {
    this.form = {
      id: record.id,
      type: record.type,
      description: record.description,
      amount: Number(record.amount),
      date: record.date,
      category: record.category || '',
      payment_method: record.payment_method || '',
      invoice_url: record.invoice_url || '',
      invoice_file_name: record.invoice_file_name || '',
      notes: record.notes || '',
      barber_id: record.barber?.id || ''
    };
    this.selectedInvoiceName = record.invoice_file_name || '';
    this.updateFilteredCategorySuggestions();
  }

  remove(record: FinanceRecord): void {
    if (!record.id) return;

    this.financeUseCase.deleteRecord(record.id).subscribe({
      next: () => this.loadRecords(),
      error: (error) => console.error(error)
    });
  }

  cancelEdit(): void {
    this.form = this.createEmptyForm();
    this.selectedInvoiceName = '';
    this.updateFilteredCategorySuggestions();
  }

  getTypeLabel(type: FinanceType): string {
    const labels: Record<FinanceType, string> = {
      [FinanceType.INCOME]: 'Ingreso',
      [FinanceType.EXPENSE]: 'Egreso',
      [FinanceType.FIXED_EXPENSE]: 'Egreso fijo',
      [FinanceType.BARBER_COMMISSION]: 'Pago barbero'
    };

    return labels[type] || type;
  }

  get isIncomeView(): boolean {
    return this.viewType === FinanceType.INCOME;
  }

  get isExpenseView(): boolean {
    return this.viewType === FinanceType.EXPENSE || this.viewType === FinanceType.FIXED_EXPENSE;
  }

  get categorySuggestions(): string[] {
    if (!this.isExpenseView) return [];

    const normalized = this.records
      .filter((record) => record.type === this.viewType)
      .map((record) => (record.category || '').trim())
      .filter((value) => !!value);

    return [...new Set(normalized)].sort((a, b) => a.localeCompare(b));
  }

  onCategoryInputChange(value: string): void {
    const term = (value || '').trim().toLowerCase();
    if (!term) {
      this.filteredCategorySuggestions = this.categorySuggestions;
      return;
    }

    this.filteredCategorySuggestions = this.categorySuggestions.filter((category) =>
      category.toLowerCase().includes(term)
    );
  }

  get incomeSummaryLabel(): string {
    if (this.incomeRange === 'week') {
      return `Total ingresos de la semana ${this.selectedWeek}`;
    }
    if (this.incomeRange === 'month') {
      return 'Total ingresos del mes';
    }
    return 'Total ingresos del dia';
  }

  get summaryLabel(): string {
    if (this.isIncomeView) {
      return this.incomeSummaryLabel;
    }

    if (this.viewType === FinanceType.FIXED_EXPENSE) {
      return 'Total egresos fijos';
    }

    return 'Total egresos del mes';
  }

  get summaryAmount(): number {
    if (this.isIncomeView) {
      return this.totalIncome;
    }

    return this.sumRecords(this.visibleRecords);
  }

  get dayFilterMinDate(): Date {
    return new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), 1);
  }

  get dayFilterMaxDate(): Date {
    return new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth() + 1, 0);
  }

  async onInvoiceFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.selectedInvoiceName = file.name;
    const base64 = await this.readInvoiceAsBase64(file);
    this.form.invoice_url = base64;
    this.form.invoice_file_name = file.name;
  }

  clearInvoice(): void {
    this.selectedInvoiceName = '';
    this.form.invoice_url = '';
    this.form.invoice_file_name = '';
  }

  openInvoice(url?: string, fileName?: string): void {
    if (!url) {
      return;
    }

    this.activeInvoiceUrl = url;
    this.activeInvoiceName = fileName || 'Factura adjunta';
    this.activeInvoiceType = this.detectInvoiceType(url, fileName);
    this.activeInvoiceSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.isInvoiceModalOpen = true;
  }

  closeInvoiceModal(): void {
    this.isInvoiceModalOpen = false;
    this.activeInvoiceName = '';
    this.activeInvoiceUrl = '';
    this.activeInvoiceSafeUrl = null;
    this.activeInvoiceType = 'other';
  }

  setIncomeRange(range: 'day' | 'week' | 'month'): void {
    this.incomeRange = range;
    if (range === 'week') {
      this.ensureValidSelectedWeek();
    }
    if (range === 'day') {
      this.ensureDayFilterInCurrentMonth();
    }
    this.recalculateVisibleRecords();
  }

  onWeekChange(): void {
    this.ensureValidSelectedWeek();
    this.recalculateVisibleRecords();
  }

  private buildWeekOptions(): Array<{ value: number; label: string }> {
    const year = this.selectedDate.getFullYear();
    const month = this.selectedDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const totalWeeks = Math.ceil(daysInMonth / 7);

    const options: Array<{ value: number; label: string }> = [];
    for (let week = 1; week <= totalWeeks; week++) {
      const startDay = (week - 1) * 7 + 1;
      const endDay = Math.min(week * 7, daysInMonth);
      options.push({
        value: week,
        label: `Semana ${week} (${startDay}-${endDay})`
      });
    }

    return options;
  }

private createEmptyForm(): Partial<FinanceRecord> {
  return {
    type: this.viewType,
    description: '',
    amount: 0,
    date:
      this.viewType === FinanceType.FIXED_EXPENSE
        ? ''
        : this.getLocalDateString(),
    category: '',
    payment_method: '',
    invoice_url: '',
    invoice_file_name: '',
    notes: '',
    barber_id: ''
  };
}
get isFixedExpense(): boolean {
  return this.viewType === FinanceType.FIXED_EXPENSE;
}
  private getLocalDateString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private normalizeDate(value: any): string {
    if (!value) return '';

    const raw = String(value);
    if (raw.length >= 10) {
      return raw.slice(0, 10);
    }

    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) {
      return raw;
    }

    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getSelectedReferenceDate(): Date {
    const selected = this.selectedDayDate ? new Date(this.selectedDayDate) : new Date();
    return Number.isNaN(selected.getTime()) ? new Date() : selected;
  }

  private getWeekRangeByMonthWeek(week: number): { start: Date; end: Date } {
    const year = this.selectedDate.getFullYear();
    const month = this.selectedDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const safeWeek = Math.max(1, Math.min(week, Math.ceil(daysInMonth / 7)));
    const startDay = (safeWeek - 1) * 7 + 1;
    const endDay = Math.min(safeWeek * 7, daysInMonth);

    const start = new Date(year, month, startDay);
    start.setHours(0, 0, 0, 0);

    const end = new Date(year, month, endDay);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  private toLocalDate(value: any): Date | null {
    const normalized = this.normalizeDate(value);
    const parts = normalized.split('-').map(Number);
    if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
      return null;
    }
    const [year, month, day] = parts;
    return new Date(year, month - 1, day);
  }

  private toDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getWeekNumberByDay(dayOfMonth: number): number {
    return Math.max(1, Math.ceil(dayOfMonth / 7));
  }

  private updateWeekOptions(): void {
    this.weekOptions = this.buildWeekOptions();
  }

  private ensureValidSelectedWeek(): void {
    if (!this.weekOptions.some((option) => option.value === this.selectedWeek)) {
      this.selectedWeek = this.weekOptions[0]?.value ?? 1;
    }
  }

  private setDefaultSelectedWeekFromSelectedDate(): void {
    const preferredWeek = this.getWeekNumberByDay(this.selectedDate.getDate());
    this.selectedWeek = this.weekOptions.some((option) => option.value === preferredWeek)
      ? preferredWeek
      : this.weekOptions[0]?.value ?? 1;
  }

  private ensureDayFilterInCurrentMonth(): void {
    const year = this.selectedDate.getFullYear();
    const month = this.selectedDate.getMonth();

    if (
      this.selectedDayDate.getFullYear() !== year ||
      this.selectedDayDate.getMonth() !== month
    ) {
      this.selectedDayDate = new Date(year, month, 1);
    }
  }

  private recalculateVisibleRecords(): void {
    if (!this.isIncomeView) {
      this.visibleRecords = this.records;
      this.totalIncome = 0;
      return;
    }

    if (this.incomeRange === 'month') {
      this.visibleRecords = this.records;
      this.totalIncome = this.sumRecords(this.visibleRecords);
      return;
    }

    if (this.incomeRange === 'week') {
      const weekRange = this.getWeekRangeByMonthWeek(this.selectedWeek);
      this.visibleRecords = this.records.filter((record) => {
        const date = this.toLocalDate(record.date);
        if (!date) return false;
        return date >= weekRange.start && date <= weekRange.end;
      });
      this.totalIncome = this.sumRecords(this.visibleRecords);
      return;
    }

    const selectedDay = this.toDateString(this.getSelectedReferenceDate());
    this.visibleRecords = this.records.filter(
      (record) => this.normalizeDate(record.date) === selectedDay
    );
    this.totalIncome = this.sumRecords(this.visibleRecords);
  }

  private sumRecords(records: FinanceRecord[]): number {
    return records.reduce((acc, item) => acc + Number(item.amount || 0), 0);
  }

  private updateFilteredCategorySuggestions(): void {
    this.filteredCategorySuggestions = this.categorySuggestions;
  }

  private detectInvoiceType(url?: string, fileName?: string): 'image' | 'pdf' | 'other' {
    const source = `${fileName || ''} ${url || ''}`.toLowerCase();
    if (
      source.includes('data:image/') ||
      source.includes('.png') ||
      source.includes('.jpg') ||
      source.includes('.jpeg') ||
      source.includes('.webp')
    ) {
      return 'image';
    }

    if (source.includes('data:application/pdf') || source.includes('.pdf')) {
      return 'pdf';
    }

    return 'other';
  }

  private async readInvoiceAsBase64(file: File): Promise<string> {
    if (file.type.startsWith('image/')) {
      return this.compressImageFile(file);
    }

    return this.readFileAsDataUrl(file);
  }

  private async compressImageFile(file: File): Promise<string> {
    const source = await this.loadImageElement(file);
    const maxWidth = 1600;
    const maxHeight = 1600;
    const scale = Math.min(maxWidth / source.width, maxHeight / source.height, 1);
    const targetWidth = Math.max(1, Math.round(source.width * scale));
    const targetHeight = Math.max(1, Math.round(source.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const context = canvas.getContext('2d');
    if (!context) {
      return this.readFileAsDataUrl(file);
    }

    context.drawImage(source, 0, 0, targetWidth, targetHeight);

    const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    const quality = mimeType === 'image/png' ? undefined : 0.82;
    const compressed = canvas.toDataURL(mimeType, quality);

    if (compressed.length >= file.size * 1.37) {
      return this.readFileAsDataUrl(file);
    }

    return compressed;
  }

  private loadImageElement(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('No fue posible procesar la imagen.'));
        image.src = typeof reader.result === 'string' ? reader.result : '';
      };
      reader.onerror = () => reject(new Error('No fue posible leer la imagen.'));
      reader.readAsDataURL(file);
    });
  }

  private readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.onerror = () => reject(new Error('No fue posible leer el archivo.'));
      reader.readAsDataURL(file);
    });
  }
}
