import { Observable } from "rxjs";
import { Reward } from "../reward";

export abstract class RewardGateway {

  abstract getAll(): Observable<Reward[]>;

  abstract create(data: Partial<Reward>): Observable<Reward>;

  abstract update(id: string, data: Partial<Reward>): Observable<Reward>;

  abstract deactivate(id: string): Observable<Reward>;

  abstract validateHash(code: string): Observable<void>;
}
