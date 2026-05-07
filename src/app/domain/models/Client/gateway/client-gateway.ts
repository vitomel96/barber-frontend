import { Observable } from 'rxjs';
import { Client } from '../Client';
import { RedeemDTO } from '../RedeemDTO';

export abstract class ClientGateway {

  abstract getAllClients(): Observable<Client[]>;

  abstract getActiveClients(): Observable<Client[]>;

  abstract getClientById(id: string): Observable<Client>;

  abstract createOrUpdateClient(client: Client): Observable<Client>;

  abstract deactivateClient(id: string): Observable<void>;

  abstract searchClients(term: string): Observable<Client[]>;

  abstract getPoints(phone: string): Observable<any>;

  abstract redemPoints(dto: RedeemDTO): Observable<any>;
}
