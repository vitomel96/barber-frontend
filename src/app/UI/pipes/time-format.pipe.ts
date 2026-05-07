import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeFormat',
  standalone: true,
})
export class TimeFormatPipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    if (!value) return '';

    if (value instanceof Date) {
      return this.toAmPm(value.getHours(), value.getMinutes());
    }

    const raw = String(value).trim();
    const match = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);

    if (!match) {
      return raw;
    }

    const hours = Number(match[1]);
    const minutes = Number(match[2]);

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return raw;
    }

    return this.toAmPm(hours, minutes);
  }

  private toAmPm(hours24: number, minutes: number): string {
    const period = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = hours24 % 12 || 12;
    return `${hours12}:${String(minutes).padStart(2, '0')} ${period}`;
  }
}
