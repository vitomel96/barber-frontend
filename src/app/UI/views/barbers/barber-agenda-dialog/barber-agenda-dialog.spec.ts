import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarberAgendaDialog } from './barber-agenda-dialog';

describe('BarberAgendaDialog', () => {
  let component: BarberAgendaDialog;
  let fixture: ComponentFixture<BarberAgendaDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarberAgendaDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BarberAgendaDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
