import { Observable } from "rxjs";
import { User } from "../../User/user";
import { AuthGateway } from "../gateway/auth-gateway";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class AuthUseCase {
  constructor(private authGateway: AuthGateway) {
    this.authGateway = authGateway;
  }
  login(email: string, password: string) {
    return this.authGateway.login(email, password);
  }
  logout() {
    this.authGateway.logout();
  }
  isLoggedIn() {
    return this.authGateway.isLoggedIn();
  }
  getToken() {
    return this.authGateway.getToken();
  }
  saveToken(token: string, expiresIn: number) {
    this.authGateway.saveToken(token, expiresIn);
  }
  clearToken() {
    this.authGateway.clearToken();
  }
  fetchToken() {
    return this.authGateway.fetchToken();
  }

  getUserInfo(): Observable<User> {
    return this.authGateway.getUserInfo();
  }
  
  refreshCrendentials(clientId:string, value?: string): Observable<any> {
    return this.authGateway.refreshCredentials(clientId, value);
  }
}
