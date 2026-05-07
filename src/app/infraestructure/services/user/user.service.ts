import { Injectable } from '@angular/core';
import { GenericService } from '../../helpers/generic.service';
import { environment } from '../../../../environments/environment';
import { UserGateway } from '../../../domain/models/User/gateway/user-gateway';
import { User } from '../../../domain/models/User/user';
import { Observable } from 'rxjs';
import { States } from '../../../domain/models/States/states';

@Injectable({
  providedIn: 'root',
})
export class UserService extends UserGateway {
  private _url = environment.backendURL;
  constructor(private genericService: GenericService) {
    super();
  }

  getAllUsers(): Observable<User[]> {
    return this.genericService.get<User>(this._url, 'user', 'page=0&size=0');
  }

  getAllUsersActive(): Observable<User[]> {
    return this.genericService.get<User>(this._url, 'user/active');
  }

  getStates(): Observable<States[]> {
    return this.genericService.get<States[]>(this._url, 'user/states');
  }

  getAllViews(): Observable<any[]> {
    return this.genericService.get<any>(this._url, 'role/views');
  }

  createOrUpdateUser(user: User): Observable<User> {
    return this.genericService.post<User>(this._url, 'user', user);
  }

  getUserById(userId: string): Observable<User> {
    return this.genericService.get<User>(this._url, `user/${userId}`);
  }

    getUserByEmail(email: string): Observable<User> {
    return this.genericService.get<User>(this._url, `user/email?value=${email}`);
  }
  getUsersByRole(roleId: string): Observable<User[]> {
    return this.genericService.get<User[]>(this._url, `user/rol/${roleId}`);
  }

}
