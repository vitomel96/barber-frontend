import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { RewardUseCase } from '../../../../domain/models/Reward/usecase/rewardusecase';
import { Reward } from '../../../../domain/models/Reward/reward';
import { RewardDialog } from '../reward-dialog/reward-dialog';
import { ValidateRedeemDialog } from '../validate-redeem-dialog/validate-redeem-dialog';

@Component({
  selector: 'app-reward-admin',
   imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule
  ],
  templateUrl: './reward-admin.html',
  styleUrl: './reward-admin.scss',
})
export class RewardAdmin {
  rewards: Reward[] = [];

  constructor(
    private rewardUseCase: RewardUseCase,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadRewards();
  }

  loadRewards() {
    this.rewardUseCase.getAll()
      .subscribe(res => this.rewards = res);
  }

  openCreateDialog() {
    const ref = this.dialog.open(RewardDialog);

    ref.afterClosed().subscribe(result => {
      if (result) this.loadRewards();
    });
  }

  edit(reward: Reward) {
    const ref = this.dialog.open(RewardDialog, {
      data: reward
    });

    ref.afterClosed().subscribe(result => {
      if (result) this.loadRewards();
    });
  }

  validateHash() {
    this.dialog.open(ValidateRedeemDialog);
  }
}
