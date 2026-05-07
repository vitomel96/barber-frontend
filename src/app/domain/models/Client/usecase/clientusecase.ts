import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Client } from "../Client";
import { ClientGateway } from "../gateway/client-gateway";
import { RedeemDTO } from "../RedeemDTO";

@Injectable({
  providedIn: "root",
})
export class ClientUseCase {

  constructor(private clientGateway: ClientGateway) {}

  getAllClients(): Observable<Client[]> {
    return this.clientGateway.getAllClients();
  }

  getActiveClients(): Observable<Client[]> {
    return this.clientGateway.getActiveClients();
  }

  getClientById(id: string): Observable<Client> {
    return this.clientGateway.getClientById(id);
  }

  createOrUpdateClient(client: Client): Observable<Client> {
    return this.clientGateway.createOrUpdateClient(client);
  }

  deactivateClient(id: string): Observable<void> {
    return this.clientGateway.deactivateClient(id);
  }

  getPoitns(phone: string): Observable<any> {
    return this.clientGateway.getPoints(phone);
  }

  redemPoints(dto: RedeemDTO): Observable<any> {
    return this.clientGateway.redemPoints(dto);
  }
}
