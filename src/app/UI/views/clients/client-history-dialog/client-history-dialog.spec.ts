import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientHistoryDialog } from './client-history-dialog';

describe('ClientHistoryDialog', () => {
  let component: ClientHistoryDialog;
  let fixture: ComponentFixture<ClientHistoryDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientHistoryDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientHistoryDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
