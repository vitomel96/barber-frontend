import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Service } from "../service";
import { ServiceGateway } from "../gateway/service-gateway";

@Injectable({
  providedIn: "root",
})
export class ServiceUseCase {

  constructor(private serviceGateway: ServiceGateway) {}

  getAllServices(): Observable<Service[]> {
    return this.serviceGateway.getAllServices();
  }

  getActiveServices(): Observable<Service[]> {
    return this.serviceGateway.getActiveServices();
  }

  createOrUpdateService(service: Service): Observable<Service> {
    return this.serviceGateway.createOrUpdateService(service);
  }

  deactivateService(id: string): Observable<void> {
    return this.serviceGateway.deactivateService(id);
  }

}
