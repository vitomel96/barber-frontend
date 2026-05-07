import { Observable } from "rxjs";
import { User } from "../../User/user";

export abstract class AuthGateway {
    abstract login(email: string, password: string): Observable<User>;
    abstract logout(): void;
    abstract isLoggedIn(): boolean;
    abstract getToken(): string | null;
    abstract saveToken(token: string, expiresIn: number): void;
    abstract clearToken(): void;
    abstract fetchToken(): Observable<string>;
    abstract getUserInfo(): Observable<User>;
    abstract refreshCredentials(clientId: string, value?: string): Observable<any>;
}