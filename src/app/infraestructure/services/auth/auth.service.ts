import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import {
  BehaviorSubject,
  catchError,
  delay,
  map,
  Observable,
  of,
  throwError,
} from "rxjs";
import { Router } from "@angular/router";
import { GenericService } from "../../helpers/generic.service";
import { User } from "../../../domain/models/User/user";
import { AuthGateway } from "../../../domain/models/Auth/gateway/auth-gateway";
import { environment } from "../../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class AuthService extends AuthGateway {
  private readonly TOKEN_KEY = "lebarber_auth_token";
  private readonly EXPIRATION_KEY = "lebarber_auth_exp";
  private readonly BACKEND_URL = environment.backendURL;
  private readonly HASH = environment.hash;


  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private genericService: GenericService,
    private router: Router,
    private http: HttpClient
  ) {
    super();
    const userJson = localStorage.getItem("lebarber-user");
    if (userJson) {
      this.currentUserSubject.next(JSON.parse(userJson));
    }
  }

  isLoggedIn(): boolean {
    const user = localStorage.getItem("lebarber-user");
    return !!user;
  }

  getToken(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const expiration = localStorage.getItem(this.EXPIRATION_KEY);

    if (token && expiration && new Date(expiration) > new Date()) {
      return token;
    }

    this.clearToken();
    return null;
  }

  saveToken(token: string, expiresIn: number): void {
    const expirationDate = new Date();
    expirationDate.setSeconds(expirationDate.getSeconds() + expiresIn);
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.EXPIRATION_KEY, expirationDate.toISOString());
  }

  clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.EXPIRATION_KEY);
  }
  refreshCredentials(client_id: string, value?: string): Observable<any> {
    let url = `login/refresh/${client_id}`
    if (value){
      url = `login/refresh/${client_id}?value=${value}`
    }
    return this.genericService.post<string[]>(this.BACKEND_URL,url);
  }
  fetchToken(): Observable<string> {
    const headers = new HttpHeaders().set("X-Skip-Auth", "true");

    return this.http
      .post<{ access_token: string }>(
        `${this.BACKEND_URL}/auth`,
        { hash: this.HASH },
        { headers }
      )
      .pipe(
        map((res) => {
          if (!res?.access_token) throw new Error("No token in response");
          this.saveToken(res.access_token, 3600); // 1 hora
          return res.access_token;
        }),
        catchError((err) => {
          console.error("❌ Error al obtener token:", err);
          return throwError(() => err);
        })
      );
  }

  login(username: string, password: string): Observable<User> {
    const encodedPassword = btoa(password);
    const credentials = {
      username: username,
      password: encodedPassword,
    };

    return this.genericService
      .post<User>(this.BACKEND_URL, "auth/login", credentials)
      .pipe(
        map((user) => {
          console.log(user.access_token)
          localStorage.setItem("lebarber-user", JSON.stringify(user));
          this.currentUserSubject.next(user);
          return user;
        }),
        catchError((error) => {
          console.error("❌ Error de login:", error);
          return throwError(() => error);
        })
      );
  }

  getUserInfo(): Observable<User> {
    const userJson = localStorage.getItem("lebarber-user");
    if (userJson) {
      const user: User = JSON.parse(userJson);
      return of(user);
    }
    return throwError(() => new Error("No user found in localStorage"));
  }

  logout(): void {
    this.clearToken();
    localStorage.removeItem("lebarber-user");
    this.currentUserSubject.next(null);
    this.router.navigate(["/auth"]);
  }
}
