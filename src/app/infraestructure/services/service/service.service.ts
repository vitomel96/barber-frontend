import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GenericService } from '../../helpers/generic.service';
import { environment } from '../../../../environments/environment';
import { ServiceGateway } from '../../../domain/models/Service/gateway/service-gateway';
import { Service } from '../../../domain/models/Service/service';

@Injectable({
  providedIn: 'root',
})
export class ServiceService extends ServiceGateway {

  private _url = environment.backendURL;

  constructor(private genericService: GenericService) {
    super();
  }

  getAllServices(): Observable<Service[]> {
    return this.genericService.get<Service[]>(this._url, 'services');
  }

  getActiveServices(): Observable<Service[]> {
    return this.genericService.get<Service[]>(this._url, 'services/active');
  }

  getServiceById(id: string): Observable<Service> {
    return this.genericService.get<Service>(this._url, `services/${id}`);
  }

  createOrUpdateService(service: Service): Observable<Service> {
    return this.genericService.post<Service>(this._url, 'services', service);
  }

  deactivateService(id: string): Observable<void> {
    return this.genericService.delete<void>(this._url, `services/${id}`);
  }
}
