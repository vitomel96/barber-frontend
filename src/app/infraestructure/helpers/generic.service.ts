import { Injectable } from "@angular/core";
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from "@angular/common/http";
import { catchError, retryWhen, concatMap, delay, take } from "rxjs/operators";
import { concat, Observable, of, throwError } from "rxjs";
import { Router } from "@angular/router";

export interface Options {
  headers?: HttpHeaders;
  params?: HttpParams;
}

@Injectable({
  providedIn: "root",
})
export class GenericService {
  headers?: HttpHeaders;
  constructor(private http: HttpClient, private router: Router) {}

  public createOptions(opts: Options): Options {
    if (opts) {
      opts = {
        params: opts.params,
        headers: opts.headers,
      };
    }
    return opts;
  }

  public get<T>(
    url?: string,
    endpoint?: string,
    params?: string,
    headers?: HttpHeaders
  ): Observable<any> {
    const endpointUri = params ? `${endpoint}?` : `${endpoint}`;
    return this.http
      .get<T>(`${url}/${endpointUri}` + (params ?? ""), { headers })
      .pipe(
        retryWhen((errors) =>
          errors.pipe(
            concatMap((result: any) => {
              if (result.code === 504) {
                return of(result);
              }
              return throwError(result);
            }),
            delay(1000),
            take(4),
            (o) =>
              concat(
                o,
                throwError(`No fue posible conectarse con el servidor.`)
              )
          )
        ),
        catchError((err: HttpErrorResponse) => {
          return this.handleError(err);
        })
      );
  }

  public post<T>(
    url?: string,
    endpoint?: string,
    model?: any,
    headers?: HttpHeaders
  ): Observable<any> {
    return this.http.post<T>(`${url}/${endpoint}`, model, { headers });
  }

  public put<T>(
    url?: string,
    endpoint?: string,
    model?: any,
    headers?: HttpHeaders,
    params?: string
  ): Observable<any> {
    let urlEndpoint = "";
    if (params) {
      urlEndpoint = `${url}/${endpoint}${params}`;
    } else {
      urlEndpoint = `${url}/${endpoint}`;
    }
    return this.http.put<T>(urlEndpoint, model, { headers }).pipe(
      retryWhen((errors) =>
        errors.pipe(
          concatMap((result: any) => {
            if (result.code === 504) {
              return of(result);
            }
            return throwError(result);
          }),
          delay(1000),
          take(4),
          (o) =>
            concat(o, throwError(`No fue posible conectarse con el servidor.`))
        )
      ),
      catchError((err: HttpErrorResponse) => {
        return this.handleError(err);
      })
    );
  }

  public patch<T>(
    url?: string,
    endpoint?: string,
    model?: any,
    headers?: HttpHeaders
  ): Observable<any> {
    return this.http.patch<T>(`${url}/${endpoint}`, model, { headers }).pipe(
      retryWhen((errors) =>
        errors.pipe(
          concatMap((result: any) => {
            if (result.code === 504) {
              return of(result);
            }
            return throwError(result);
          }),
          delay(1000),
          take(4),
          (o) =>
            concat(o, throwError(`No fue posible conectarse con el servidor.`))
        )
      ),
      catchError((err: HttpErrorResponse) => {
        return this.handleError(err);
      })
    );
  }

  public delete<T>(
    url?: string,
    endpoint?: string,
    headers?: HttpHeaders
  ): Observable<any> {
    return this.http.delete(`${url}/${endpoint}`, { headers }).pipe(
      retryWhen((errors) =>
        errors.pipe(
          concatMap((result: any) => {
            if (result.code === 504) {
              return of(result);
            }
            return throwError(result);
          }),
          delay(1000),
          take(4),
          (o) =>
            concat(o, throwError(`No fue posible conectarse con el servidor.`))
        )
      ),
      catchError((err: HttpErrorResponse) => {
        return this.handleError(err);
      })
    );
  }

  public postFile(
    url?: string,
    endpoint?: string,
    model?: any,
    headers?: HttpHeaders
  ): Observable<any> {
    const httpOptions = {
      responseType: "blob" as "json",
      headers,
    };
    return this.http.post(`${url}/${endpoint}`, model, httpOptions).pipe(
      retryWhen((errors) =>
        errors.pipe(
          concatMap((result: any) => {
            if (result.code === 504) {
              return of(result);
            }
            return throwError(result);
          }),
          delay(1000),
          take(4),
          (o) =>
            concat(o, throwError(`No fue posible conectarse con el servidor.`))
        )
      ),
      catchError((err: HttpErrorResponse) => {
        return this.handleError(err);
      })
    );
  }

  public getFile(
    url?: string,
    endpoint?: string,
    params?: string,
    headers?: HttpHeaders
  ) {
    const endpointUri = params ? `${endpoint}?` : `${endpoint}`;
    const httpOptions = {
      responseType: "blob" as "json",
      headers,
    };
    return this.http
      .get(`${url}/${endpointUri}` + (params ?? ""), httpOptions)
      .pipe(
        retryWhen((errors) =>
          errors.pipe(
            concatMap((result: any) => {
              if (result.code === 504) {
                return of(result);
              }
              return throwError(result);
            }),
            delay(1000),
            take(4),
            (o) =>
              concat(
                o,
                throwError(`No fue posible conectarse con el servidor.`)
              )
          )
        ),
        catchError((err: HttpErrorResponse) => {
          return this.handleError(err);
        })
      );
  }

  private handleError(error: HttpErrorResponse): any {
    if (error.error != null && error.error.message === "No Auth") {
      this.router.navigate(["/"]);
      localStorage.clear();
    }
    let messageError =
      error.error != null &&
      error.error.errores !== undefined &&
      error.error.errores.length > 0
        ? " presenta el siguiente error: <p><b>" +
          error.error.errores[0].descripcion +
          "</b></p>"
        : ".";

    messageError =
      messageError === "." && error.error.errores !== undefined
        ? " presenta el siguiente error: <p><b>" +
          error.error.errores[0].descripcion +
          "</b></p>"
        : ".";

    console.log(messageError);
    return throwError(error);
  }
}
