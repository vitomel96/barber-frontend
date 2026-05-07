import { Observable } from "rxjs";
import { User } from "../user";
import { States } from "../../States/states";

export abstract class UserGateway {
  abstract getAllUsers(): Observable<User[]>;
  abstract getAllUsersActive(): Observable<User[]>;
  abstract getAllViews(): Observable<any[]>;
  abstract getStates(): Observable<States[]>;
  abstract getUserByEmail(email: string): Observable<User>;
  abstract createOrUpdateUser(user: User): Observable<User>;
  abstract getUserById(userId: string): Observable<User>;
  abstract getUsersByRole(roleId: string): Observable<User[]>;
}
