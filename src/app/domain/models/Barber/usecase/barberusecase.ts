import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Barber } from "../barber";
import { BarberGateway } from "../gateway/barber-gateway";

@Injectable({
  providedIn: "root",
})
export class BarberUseCase {

  constructor(private barberGateway: BarberGateway) {}

  getAllBarbers(): Observable<Barber[]> {
    return this.barberGateway.getAllBarbers();
  }

  getActiveBarbers(): Observable<Barber[]> {
    return this.barberGateway.getActiveBarbers();
  }

  getSchedule(barberId: string, date: string): Observable<any> {
    return this.barberGateway.getSchedule(barberId, date);
  }

  getBarberById(id: string): Observable<Barber> {
    return this.barberGateway.getBarberById(id);
  }

  createOrUpdateBarber(barber: Barber): Observable<Barber> {
    return this.barberGateway.createOrUpdateBarber(barber);
  }

  deactivateBarber(id: string): Observable<void> {
    return this.barberGateway.deactivateBarber(id);
  }

}
