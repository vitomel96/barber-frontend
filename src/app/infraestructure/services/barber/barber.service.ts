import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GenericService } from '../../helpers/generic.service';
import { environment } from '../../../../environments/environment';
import { BarberGateway } from '../../../domain/models/Barber/gateway/barber-gateway';
import { Barber } from '../../../domain/models/Barber/barber';
import { BarberTimeOff } from '../../../domain/models/Barber/barber-time-off';

@Injectable({
  providedIn: 'root',
})
export class BarberService extends BarberGateway {

  private _url = environment.backendURL;

  constructor(private genericService: GenericService) {
    super();
  }

  getAllBarbers(): Observable<Barber[]> {
    return this.genericService.get<Barber[]>(this._url, 'barbers');
  }

  getActiveBarbers(): Observable<Barber[]> {
    return this.genericService.get<Barber[]>(this._url, 'barbers/active');
  }

  getBarberById(id: string): Observable<Barber> {
    return this.genericService.get<Barber>(this._url, `barbers/${id}`);
  }
createOrUpdateBarber(barber: Barber): Observable<Barber> {
  const payload = { ...barber };

  if (!payload.id) {
    delete payload.id;
    return this.genericService.post<Barber>(this._url, 'barbers', payload);
  }

  return this.genericService.patch<Barber>(
    this._url,
    `barbers/${payload.id}`,
    payload
  );
}
override getSchedule(barberId: string, date: string): Observable<any> {
  return this.genericService.get<any>(this._url, `barbers/${barberId}/schedule?date=${date}`);
}
  deactivateBarber(id: string): Observable<void> {
    return this.genericService.delete<void>(this._url, `barbers/${id}`);
  }

  getBarberTimeOff(barberId: string): Observable<BarberTimeOff[]> {
    return this.genericService.get<BarberTimeOff[]>(this._url, `barbers/${barberId}/time-off`);
  }

  addTimeOff(timeOff: BarberTimeOff): Observable<BarberTimeOff> {
    return this.genericService.post<BarberTimeOff>(this._url, `barbers/time-off`, timeOff);
  }

  deleteTimeOff(id: string): Observable<void> {
    return this.genericService.delete<void>(this._url, `barbers/time-off/${id}`);
  }
}
