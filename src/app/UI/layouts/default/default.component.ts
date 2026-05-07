import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Footer } from "../../share/footer/footer";

@Component({
  selector: 'app-default',
  standalone: true,
  imports: [RouterModule, Footer],
  templateUrl: './default.component.html',
  styleUrl: './default.component.css'
})
export class DefaultComponent {

}
