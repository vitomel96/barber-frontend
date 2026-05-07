import { Component, CUSTOM_ELEMENTS_SCHEMA, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Footer } from "../../share/footer/footer";
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthUseCase } from '../../../domain/models/Auth/usecase/authusecase';

@Component({
  selector: 'app-internal',
  standalone: true,
  imports: [RouterModule, CommonModule, Footer,   MatSidenavModule,
  MatToolbarModule,
  MatIconModule,
  MatListModule,],
  templateUrl: './internal.component.html',
  styleUrl: './internal.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class InternalComponent implements OnInit, OnDestroy {
  user: any;
  isDesktop = true;
  isSidebarOpened = true;
  isMobileSidebarOpened = false;
  financeMenuOpen = false;
  private onResizeHandler = () => this.checkScreen();

  constructor(private authUseCase: AuthUseCase){}
  ngOnInit(): void {
    this.authUseCase.getUserInfo().subscribe(user => {
      this.user = user;
    });
    this.checkScreen();
    window.addEventListener('resize', this.onResizeHandler);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onResizeHandler);
  }

  checkScreen() {
    this.isDesktop = window.innerWidth > 768;
    if (this.isDesktop) {
      this.isSidebarOpened = true;
      this.isMobileSidebarOpened = false;
    }
  }

  toggleSidenav(sidenav: MatSidenav): void {
    if (this.isDesktop) {
      this.isSidebarOpened = !this.isSidebarOpened;
      return;
    }

    this.isMobileSidebarOpened = !this.isMobileSidebarOpened;
    sidenav.toggle();
  }

  toggleFinanceMenu(): void {
    this.financeMenuOpen = !this.financeMenuOpen;
  }

  getInitial(): string {
    return this.user?.user?.name?.charAt(0)?.toUpperCase() || '';
  }

  logout(){
    this.authUseCase.logout();
  }
}
