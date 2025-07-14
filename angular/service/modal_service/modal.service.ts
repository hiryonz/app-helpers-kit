import { inject, Injectable, Type } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private readonly modalCtrl = inject(ModalController);
  private currentModal: HTMLIonModalElement | null = null;

  async presentDialog(component: Type<any>, props: any = {}): Promise<any> {
    return this.openModal(component, props, {
      cssClass: 'custom-modal-class',
      backdropDismiss: true
    });
  }

  async presentSheet(component: Type<any>, props: any = {}): Promise<any> {
    return this.openModal(component, props, {
      cssClass: 'custom-sheet-modal',
      backdropDismiss: true,
      breakpoints: [0, 1, 1, 1],
      initialBreakpoint: 1
    });
  }

  async presentFullSheet(component: Type<any>, props: any = {}): Promise<any> {
    return this.openModal(component, props, {
      cssClass: 'custom-fullSheet-modal',
      backdropDismiss: false,
    });
  }

  async close(data?: string): Promise<void> {
    if (this.currentModal) {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      await this.currentModal.dismiss(data);
      this.currentModal = null;
    }
  }

  private async openModal(
    component: Type<any>,
    componentProps: any,
    options: Partial<HTMLIonModalElement>
  ): Promise<any> {
    //await this.close();
    // const buttonElement = document.activeElement as HTMLElement;
    // buttonElement.blur();
    this.currentModal = await this.modalCtrl.create({
      component,
      componentProps,
      showBackdrop: true,
      ...options
    });

    // this.listenForDismiss();

    await this.currentModal.present();

    // const result = await this.currentModal.onDidDismiss();
    // return result.data;
  }

  private listenForDismiss(): void {
    this.currentModal?.onDidDismiss().then(() => {
      this.currentModal = null;
    });
  }
}
