import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DefaultComponent } from "./UI/layouts/default/default.component";
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DefaultComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  constructor() {
    registerLocaleData(localeEs);
  }

  protected readonly title = signal('lebarber');
}
