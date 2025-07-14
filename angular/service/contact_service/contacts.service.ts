import { inject, Injectable } from '@angular/core';
import { Contacts } from '@capacitor-community/contacts';
import { Capacitor } from '@capacitor/core';
import { HttpClient } from '@angular/common/http';
import { Contact } from '../interfaces/contact';
import { firstValueFrom } from 'rxjs';
import { SimpleAlertService } from './utils/simple.alert.service';
import { environment } from 'src/environments/environment';


/**
 * ContactsService
 * ---------------
 * This Angular service provides contact-related functionality for mobile devices using the
 * @capacitor-community/contacts plugin. It allows reading, formatting, filtering, and validating 
 * device contacts, and also integrates with an external backend to check if phone numbers exist in the system.
 *
 * Key Features:
 * - Handles permission flow for accessing contacts (requests if not granted).
 * - Loads and formats device contacts, extracting clean phone numbers and names.
 * - Caches contacts to avoid redundant reads.
 * - Supports paginated access to contact data (although current pagination is disabled).
 * - Allows searching a specific contact by phone number.
 * - Integrates with a backend endpoint to validate if a contact is a known user.
 *
 * Important Notes:
 * - Only reads the first phone number per contact.
 * - Formats numbers to keep only the last 8 digits and removes non-numeric characters.
 * - Does not support web platform (alerts user if accessed via web).
 * - Uses `SimpleAlertService` to manage loading indicators during backend requests.
 *
 * Dependencies:
 * - Capacitor Contacts Plugin
 * - Angular HttpClient
 * - RxJS (firstValueFrom)
 * - Environment config for backend URL
 */


@Injectable({ providedIn: 'root' })
export class ContactsService {
  private httpClient = inject(HttpClient);
  private url: string = environment.API_URL_REG;

  private cleanedContacts: any[] = []; // { itemInfo: { name, phone } }
  private cleanedNumbers: string[] = [];
  private limit = 30;

  constructor(private alert: SimpleAlertService) {}

  async validatePermisions(): Promise<any[]> {
    if (Capacitor.getPlatform() === 'web') {
      alert("No está implementado para web");
      return [];
    }

    const permissionStatus = await Contacts.checkPermissions();
    if (permissionStatus.contacts === 'granted') {
      return this.loadAllDeviceContacts();
    } else {
      await Contacts.requestPermissions();
      return this.validatePermisions();
    }
  }

  async loadAllDeviceContacts(): Promise<any[]> {
    const result = await Contacts.getContacts({ projection: { name: true, phones: true } });

    if (!result.contacts) return [];

    const formattedContacts: { itemInfo: { name: string; phone: string } }[] = [];
    const numbers: string[] = [];

    for (const contact of result.contacts) {
      const name = contact.name?.display || 'Sin nombre';
      const phone = contact.phones?.[0]?.number || '';

      const formatedPhone = phone.replace(/\D/g, '').slice(-8);
      const formatedName = name.trim().replace(/\s{2,}/g, ' ');

      if (formatedPhone.length === 8) {
        numbers.push(formatedPhone);
        formattedContacts.push({ itemInfo: { name: formatedName, phone: formatedPhone } });
      }
    }

    this.cleanedContacts = Array.from(new Map(formattedContacts.map(c => [c.itemInfo.phone, c])).values());
    this.cleanedNumbers = Array.from(new Set(numbers));

    return this.cleanedContacts;
  }

  async getPaginatedContacts(page: number): Promise<any[]> {
    const all = await this.validatePermisions();
    //const start = page * this.limit;
    //all.slice(start, start + this.limit);
    return all
  }

  async findContacts(targetPhone: string): Promise<any> {
    const contacts = await this.loadAllDeviceContacts();
    return contacts.find(c => c.itemInfo.phone === targetPhone);
  }

  async validateContact(phone: String): Promise<any> {
    if (!phone) return false;

    try {
      await this.alert.openLoadingAlert();
      const response = await firstValueFrom(this.httpClient.post<any>(`${this.url}/user/checkPhones`, { phones: phone }));
      if (response && Object.keys(response).length > 0) {
        return response;
      } else {
        return false;
      }      
    } catch {
      return false;
    } finally {
      await this.alert.closeLoadingAlert();
    }
  }
}
