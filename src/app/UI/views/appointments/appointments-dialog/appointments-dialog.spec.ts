import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppointmentsDialogComponent } from './appointments-dialog';


describe('AppointmentsDialog', () => {
  let component: AppointmentsDialogComponent;
  let fixture: ComponentFixture<AppointmentsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentsDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointmentsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
