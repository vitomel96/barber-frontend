import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private _loadingCount = 0;
  private _loading = false;
  loadingStatus: Subject<boolean> = new Subject();

  get loading(): boolean {
    return this._loading;
  }

  private setLoading(value: boolean) {
    this._loading = value;
    this.loadingStatus.next(value);
  }

  startLoading(): void {
    this._loadingCount++;
    if (!this._loading) {
      this.setLoading(true);
    }
  }

  stopLoading(): void {
    if (this._loadingCount > 0) {
      this._loadingCount--;
    }
    if (this._loadingCount === 0 && this._loading) {
      this.setLoading(false);
    }
  }
}
