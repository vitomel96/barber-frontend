import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GenericService } from '../../helpers/generic.service';
import { environment } from '../../../../environments/environment';
import { ClientGateway } from '../../../domain/models/Client/gateway/client-gateway';
import { Client } from '../../../domain/models/Client/Client';
import { RedeemDTO } from '../../../domain/models/Client/RedeemDTO';

@Injectable({
  providedIn: 'root',
})
export class ClientService extends ClientGateway {

  private _url = environment.backendURL;

  constructor(private genericService: GenericService) {
    super();
  }

  getAllClients(): Observable<Client[]> {
    return this.genericService.get<Client[]>(this._url, 'clients');
  }
  
getHistory(id:string){
  return this.genericService.get<any>(this._url, `clients/${id}/history`);
}
  getActiveClients(): Observable<Client[]> {
    return this.genericService.get<Client[]>(this._url, 'clients/active');
  }

  getClientById(id: string): Observable<Client> {
    return this.genericService.get<Client>(this._url, `clients/${id}`);
  }

  createOrUpdateClient(client: Client): Observable<Client> {
    if(client.id){
      return this.genericService.patch<Client>(this._url,  `clients/${client.id}`, client )
    } else{
    return this.genericService.post<Client>(this._url, 'clients', client);
    }
  }

  getPoints(phone: string){
    return this.genericService.get<any>(this._url, `clients/points/${phone}`)
  }

  redemPoints(dto: RedeemDTO){
    return this.genericService.post<any>(this._url, 'clients/redeem', dto)
  }
  deactivateClient(id: string): Observable<void> {
    return this.genericService.delete<void>(this._url, `clients/${id}`);
  }

  searchClients(term: string): Observable<Client[]> {
    return this.genericService.get<Client[]>(this._url, `clients/search?value=${term}`);
  }
}
