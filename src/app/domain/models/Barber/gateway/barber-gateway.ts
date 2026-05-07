import { Observable } from 'rxjs';
import { Barber } from '../barber';
import { BarberTimeOff } from '../barber-time-off';

export abstract class BarberGateway {

  abstract getAllBarbers(): Observable<Barber[]>;

  abstract getActiveBarbers(): Observable<Barber[]>;

  abstract getBarberById(id: string): Observable<Barber>;

  abstract createOrUpdateBarber(barber: Barber): Observable<Barber>;

  abstract getSchedule(barberId: string, date: string): Observable<any>;
  
  abstract deactivateBarber(id: string): Observable<void>;

  abstract getBarberTimeOff(barberId: string): Observable<BarberTimeOff[]>;

  abstract addTimeOff(timeOff: BarberTimeOff): Observable<BarberTimeOff>;

  abstract deleteTimeOff(id: string): Observable<void>;
}
