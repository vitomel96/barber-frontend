import { Injectable } from "@angular/core";
import { GenericService } from "../../generic.service";
import { Reward } from "../../../domain/models/Reward/reward";
import { environment } from "../../../../environments/environment";
import { RewardGateway } from "../../../domain/models/Reward/gateway/reward-gateway";

@Injectable({ providedIn: 'root' })
export class RewardService extends RewardGateway {
  private _url = environment.backendURL;

  constructor(private genericService: GenericService) {
    super();
  }

  getAll() {
    return this.genericService.get<Reward[]>(this._url,'rewards');
  }

  create(data: Partial<Reward>) {
    return this.genericService.post<Reward>(this._url,'rewards', data);
  }

  update(id: string, data: Partial<Reward>) {
    return this.genericService.patch(this._url,`rewards/${id}`, data);
  }

  deactivate(id: string) {
    return this.genericService.delete(this._url,`rewards/${id}`);
  }

  validateHash(code: string) {
    return this.genericService.post(this._url,`clients/redeem/${code}`);
  }
}