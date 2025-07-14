import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private currentToast: HTMLIonToastElement | null = null;
  private isPresenting = false;

  constructor(private toastController: ToastController) { }

  async show(message: string, duration: number = 2000, color: string = 'dark', position: "bottom" | "top" | "middle" | undefined = 'top') {
    if (this.isPresenting) return;

    if (this.currentToast) {
      await this.currentToast.dismiss();
      this.currentToast = null;
    }
    this.currentToast = await this.toastController.create({
      message,
      duration,
      position: position,
      color
    });
    this.isPresenting = true;
    this.currentToast.onDidDismiss().then(() => {
      this.currentToast = null;
      this.isPresenting = false;
    });

    await this.currentToast.present();
  }

  async success(message: string) {
    await this.show(message, 2000, 'success');
  }

  async error(message: string) {
    await this.show(message, 3000, 'danger');
  }

  async warning(message: string) {
    await this.show(message, 3000, 'warning');
  }

  async info(message: string) {
    await this.show(message, 2000, 'dark', 'bottom');
  }
}
