import { DecimalPipe, NgClass, NgIf } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TimeFormatPipe } from '../../../pipes/time-format.pipe';

@Component({
  selector: 'app-appointment-detail',
  imports: [NgIf, NgClass, DecimalPipe, MatIconModule, MatDialogModule, TimeFormatPipe],
  templateUrl: './appointment-detail.html',
  styleUrl: './appointment-detail.scss',
})
export class AppointmentDetail {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit(): void {
    console.log(this.data.status);
  }
recordarCita() {
  const mensaje = this.generarMensaje();

  navigator.clipboard.writeText(mensaje).then(() => {
    console.log('Mensaje copiado');
  });
}
generarMensaje(): string {
  const nombre = this.data.client.name;
  const fecha = new Date(this.data.date).toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  const hora = this.toAmPm(this.data.hour);
  const servicio = this.data.service.name;

  return `Hola ${nombre} 👋

Te recordamos tu cita en *Le Barber Club* 💈

📅 *Fecha:* ${fecha}
⏰ *Hora:* ${hora}
✂️ *Servicio:* ${servicio}

¡Te esperamos! 🙌`;
}
abrirWhatsApp() {
  const mensaje = encodeURIComponent(this.generarMensaje());
  const telefono = this.data.client.phone; // sin + ni espacios

  const url = `https://wa.me/${telefono}?text=${mensaje}`;
  window.open(url, '_blank');
}

private toAmPm(value?: string): string {
  const raw = String(value || '').trim();
  const match = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!match) return raw;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, '0')} ${period}`;
}
}
