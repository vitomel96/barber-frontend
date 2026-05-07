import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
} from '@angular/core';
import { Subscription, Subject, debounceTime } from 'rxjs';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../../infraestructure/services/loading/loading.service';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class LoadingComponent implements AfterViewInit, OnDestroy {
  @Input() useDebounce: boolean = true;
  @Input() debounceTime: number = 200;
  @Input() loading?: boolean;
  loadingSubscription!: Subscription;
  internalLoading: boolean = false;

  private _destroy$ = new Subject<boolean>();

  constructor(
    private loadingService: LoadingService,
    private _elmRef: ElementRef,
    private _changeDetectorRef: ChangeDetectorRef
  ) {}

ngAfterViewInit(): void {
    if (this.loading === undefined) {
      this._elmRef.nativeElement.style.display = 'none';

      let loading$: import('rxjs').Observable<boolean> = this.loadingService.loadingStatus;
      if (this.useDebounce) {
        loading$ = loading$.pipe(debounceTime(this.debounceTime));
      }

      this.loadingSubscription = loading$.subscribe((status: boolean) => {
        this.internalLoading = status;
        this._elmRef.nativeElement.style.display = status ? 'block' : 'none';
        this._changeDetectorRef.detectChanges();
      });
    }
  }

  ngOnDestroy(): void {
    this.loadingSubscription?.unsubscribe();
    this._destroy$.next(true);
    this._destroy$.complete();
  }
}
