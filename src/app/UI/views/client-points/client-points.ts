import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ClientUseCase } from '../../../domain/models/Client/usecase/clientusecase';
import { MatIcon } from "@angular/material/icon";
import { RewardUseCase } from '../../../domain/models/Reward/usecase/rewardusecase';

@Component({
  selector: 'app-client-points',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    MatIcon
],
  templateUrl: './client-points.html',
  styleUrls: ['./client-points.scss']
})
export class ClientPointsComponent {

  form: FormGroup;
points: number | null = null;
rewards: any[] = [];
redeemCode: string | null = null;
  loading = false;


  constructor(
    private fb: FormBuilder,
    private clientUseCase: ClientUseCase,
    private rewardUseCase: RewardUseCase,
    private snack: MatSnackBar
  ) {
    this.form = this.fb.group({
      phone: ['', [Validators.required, Validators.minLength(7)]]
    });
  }

loadRewards() {
  this.rewardUseCase.getAll()
    .subscribe((rewards: any[]) => {
      this.rewards = rewards;
    });
}
copied = false;

copyCode() {
  if (!this.redeemCode) return;

  navigator.clipboard.writeText(this.redeemCode).then(() => {
    this.copied = true;

    setTimeout(() => {
      this.copied = false;
    }, 2000);
  });
}
  getPoints() {
    if (this.form.invalid) return;

    this.loading = true;
    this.redeemCode = null;

    const phone = this.form.value.phone;

    this.clientUseCase.getPoitns(phone)
      .subscribe({
        next: (res) => {
          this.points = res;
            this.loadRewards();
          this.loading = false;
        },
        error: () => {
          this.snack.open('Cliente no encontrado', 'Cerrar', { duration: 3000 });
          this.loading = false;
        }
      });
  }

  redeem(reward: any) {
    if (!this.points || this.points <= 0) {
      this.snack.open('No tienes puntos suficientes', 'Cerrar', { duration: 3000 });
      return;
    }

    const phone = this.form.value.phone;

    this.clientUseCase.redemPoints({
    phone: this.form.value.phone,
    reward_id: reward.id
  })
      .subscribe({
        next: (res) => {
          this.redeemCode = res.redemption_code;
          this.snack.open('Código generado correctamente', 'Cerrar', { duration: 3000 });
        },
        error: () => {
          this.snack.open('Error al generar el código', 'Cerrar', { duration: 3000 });
        }
      });
  }
}