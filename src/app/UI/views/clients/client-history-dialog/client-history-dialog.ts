import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogModule } from '@angular/material/dialog';
import { ClientService } from '../../../../infraestructure/services/client/client.service';
import { CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { MatIconModule } from "@angular/material/icon";
import { TimeFormatPipe } from '../../../pipes/time-format.pipe';

@Component({
  selector: 'app-client-history-dialog',
  imports: [MatDialogActions, MatDialogModule, CurrencyPipe, NgIf, NgFor, MatIconModule, TimeFormatPipe],
  templateUrl: './client-history-dialog.html',
  styleUrl: './client-history-dialog.scss',
})
export class ClientHistoryDialog {

  loading = true;
  history: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private clientsService: ClientService
  ) {}

  ngOnInit(): void {
    this.clientsService
      .getHistory(this.data.id)
      .subscribe((res:any) => {
        this.history = res;
        this.loading = false;
      });
  }
}
