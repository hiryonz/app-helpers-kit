import { Injectable } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class SimpleAlertService {

  constructor(
    private alertController: AlertController,
    private loadingController: LoadingController
  ) { }

  private loading: any;

  //common alert (single button)
  private async showSingleButtonAlert(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      cssClass: 'custom-alert',
      buttons: [{ text: 'Aceptar', role: 'ok' }]
    });

    await alert.present();
    await alert.onDidDismiss();
  }

  async showErrorAlert(title: string, message: string): Promise<void> {
    await this.showSingleButtonAlert(title, message);
  }


  async showOKAlert(title: string, message: string): Promise<void> {
    await this.showSingleButtonAlert(title, message);
  }


  private async LoadingAlert() {
    this.loading = await this.loadingController.create({
      message: 'Cargando...',
      spinner: 'crescent',
      cssClass: 'custom-loading-alert'
    });

  }

  async openLoadingAlert() {
    await this.LoadingAlert();

    this.loading.present();
  }

  async closeLoadingAlert() {
    if(this.loading){
      this.loading.dismiss();
    }
  }


  async showConfirm(header: string, message: string): Promise<boolean> {
    const alert = await this.alertController.create({
      header,
      message,
      cssClass: 'custom-alert',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Aceptar',
          role: 'confirm'
        }
      ]
    });
  
    await alert.present();
    const { role } = await alert.onDidDismiss();
    return role === 'confirm';
  }
  

}
