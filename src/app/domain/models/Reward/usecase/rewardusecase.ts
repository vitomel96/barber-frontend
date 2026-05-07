import { Injectable } from "@angular/core";
import { RewardGateway } from "../gateway/reward-gateway";
import { Reward } from "../reward";

@Injectable({ providedIn: 'root' })
export class RewardUseCase {

  constructor(private rewardGateway: RewardGateway) {}

  getAll() {
    return this.rewardGateway.getAll();
  }

  create(data: Partial<Reward>) {
    return this.rewardGateway.create(data);
  }

  update(id: string, data: Partial<Reward>) {
    return this.rewardGateway.update(id, data);
  }

  deactivate(id: string) {
    return this.rewardGateway.deactivate(id);
  }

  validateHash(code: string) {
    return this.rewardGateway.validateHash(code);
  }
}