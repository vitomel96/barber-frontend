import { Observable } from 'rxjs';
import { Service } from '../service';

export abstract class ServiceGateway {

  abstract getAllServices(): Observable<Service[]>;

  abstract getActiveServices(): Observable<Service[]>;

  abstract getServiceById(id: string): Observable<Service>;

  abstract createOrUpdateService(service: Service): Observable<Service>;

  abstract deactivateService(id: string): Observable<void>;
}
