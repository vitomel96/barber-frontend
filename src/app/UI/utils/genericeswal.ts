import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class GenericSwalService {
  public genericSwalFireWithTextarea(
    title: string,
    label: string,
    placeholder: string = '',
    confirmButtonText: string = 'Aceptar',
    cancelButtonText: string = 'Cancelar',
    allowOutsideClick: boolean = false,
    allowEscapeKey: boolean = false,
    backdrop: boolean = true
  ) {
    return Swal.fire({
      title: '',
      html: `
      <div class="swal-box-container" style="display: flex; flex-direction: column; gap: 10px;">
        <h2 style="font-weight: bold; color: #AF3544;">${title}</h2>
        <label style="font-weight: 600; text-align: left;">${label}</label>
        <textarea id="swal-textarea" class="swal2-textarea" placeholder="${placeholder}" style="min-height: 100px;"></textarea>
      </div>
    `,
      showCancelButton: true,
      showConfirmButton: true,
      showCloseButton: true,
      confirmButtonText,
      cancelButtonText,
      focusConfirm: false,
      allowOutsideClick,
      allowEscapeKey,
      backdrop,
      customClass: {
        popup: 'custom-swal-popup',
        confirmButton: 'swal2-confirm-button',
        cancelButton: 'swal2-cancel-button',
      },
      didOpen: () => {
        const textarea = document.getElementById(
          'swal-textarea'
        ) as HTMLTextAreaElement;
        const confirmBtn = Swal.getConfirmButton() as HTMLButtonElement;

        confirmBtn.disabled = true;

        textarea.addEventListener('input', () => {
          const isValid = textarea.value.trim().length > 0;
          confirmBtn.disabled = !isValid;
        });
      },
      preConfirm: () => {
        const value = (
          document.getElementById('swal-textarea') as HTMLTextAreaElement
        )?.value;
        if (!value || value.trim() === '') {
          Swal.showValidationMessage('Debe ingresar una justificación');
          return null;
        }
        return value.trim();
      },
    });
  }

 public genericSwalFire(
  message: string,
  showCancelButton: boolean,
  showConfirmButton: boolean,
  showCloseButton: boolean,
  type: 'alert' | 'error' | 'success' | false,
  confirmButtonText: string | undefined = 'Confirmar',
  reverseButtons: boolean = true,
  title: string = '',
  cancelButtonText: string | undefined = 'Cancelar',
  timer?: number,
  inputPlaceholder?: string,
  allowOutsideClick: boolean = false,
  allowEscapeKey: boolean = false,
  backdrop: boolean = true
) {
  reverseButtons = true;

  // 🟦 NUEVO → iconos nativos
  const icon =
    type === 'alert'
      ? 'warning'
      : type === 'error'
      ? 'error'
      : type === 'success'
      ? 'success'
      : undefined;

  const swal = Swal.fire({
    html: `
      <div class="swal-box-container px-5" style="display: flex; flex-direction: column; align-items: center; gap: 20px;">
        <h2 class="fs-4 fw-bold">${title}</h2>
        <p class="swal-p fs-5 px-3 rubik-medium text-center">${message}</p>
      </div>
    `,
    icon, // 🟦 Aquí se asigna el icono Swal
    input: inputPlaceholder ? 'text' : undefined,
    inputPlaceholder,
    inputAttributes: inputPlaceholder ? { maxlength: '500' } : undefined,
    showCloseButton,
    showConfirmButton,
    showCancelButton,
    confirmButtonText,
    cancelButtonText,
    reverseButtons,
    allowOutsideClick,
    allowEscapeKey,
    backdrop,
    customClass: {
      popup: 'custom-swal-popup',
    },
    timer,
    didOpen: () => {
      if (inputPlaceholder) {
        const confirmBtn: any = Swal.getConfirmButton();
        const input = Swal.getInput() as HTMLInputElement;
        confirmBtn.disabled = true;

        input.addEventListener('input', () => {
          confirmBtn.disabled = input.value.trim().length === 0;
        });
      }
    },
    preConfirm: (value) => {
      if (inputPlaceholder && !value.trim()) {
        Swal.showValidationMessage('Debe ingresar una descripción.');
        return false;
      }
      return value;
    },
  });

  return swal;
}

}
