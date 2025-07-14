import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UserProfile } from '../../typing/family.interface';


/**
 * CredentialsStorageService
 * -------------------------
 * This Angular service handles the secure management of user credentials and profile data 
 * using the browser's localStorage. It includes custom in-memory encryption for the JWT/JWE 
 * token to enhance client-side security.
 *
 * Main Features:
 * - Stores and retrieves user email and encrypted authentication token (JWE).
 * - Uses AES-GCM symmetric encryption with a randomly generated key stored only in RAM.
 * - Persists and restores user profile data (UserProfile).
 * - Builds authenticated HTTP headers using stored credentials.
 * - Offers utility methods to clear specific credential data from localStorage.
 *
 * Important Details:
 * - The encryption key is regenerated every session and stored in RAM (not persisted),
 *   meaning JWTs cannot be decrypted after a reload, which increases security.
 * - The JWT is split and stored as IV + ciphertext (Base64 encoded, separated by `:`).
 * - `getCredentials()` decrypts and returns the token and email for authenticated requests.
 */


@Injectable({
  providedIn: 'root'
})
export class CredentialsStorageService {

  private readonly storageKeys = {
    USERNAME: "USERNAME",
    JWT: "JWT",
    USER_DATA: "USER_DATA",
  }
  private encryptionKey = environment.LOCAL_ENCRYPTION_KEY;

  constructor() { }


  async buildHeader() {
    const { token } = await this.getCredentials();

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return headers;
  }

  async clearCredentials() {
    localStorage.removeItem(this.storageKeys.USERNAME);
    localStorage.removeItem(this.storageKeys.USER_DATA);
    localStorage.removeItem(this.storageKeys.JWT);
  }

  async removeEmailCredentials() {
    localStorage.removeItem(this.storageKeys.USERNAME);
  }

  async saveUserData(userData: UserProfile) {
    localStorage.setItem(this.storageKeys.USER_DATA, JSON.stringify(userData));
  }

  async saveCredentials(email: string, jweToken: string) {
    localStorage.setItem(this.storageKeys.USERNAME, email);
    const encrypted = await this.encrypt(jweToken);
    localStorage.setItem(this.storageKeys.JWT, encrypted);
  }

  async getUserData() {
    const userData = localStorage.getItem(this.storageKeys.USERNAME) || '';
    return JSON.parse(userData)
  }

  async getCredentials(): Promise<{ email: string; token: string }> {
    const email = localStorage.getItem(this.storageKeys.USERNAME) || '';
    const encToken = localStorage.getItem(this.storageKeys.JWT);
    const token = encToken ? await this.decrypt(encToken) : '';
    alert(token + "\n encrypted = " + encToken);
    return { email, token };
  }

  // ----- Cifrado -----

  private async encrypt(data: string): Promise<string> {
    const iv: any = crypto.getRandomValues(new Uint8Array(12));
    this.setKey(); // generate a RAM key
    const key = await this.getKey();

    const encoded = new TextEncoder().encode(data);
    const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);

    return `${this.arrayBufferToBase64(iv)}:${this.arrayBufferToBase64(cipher)}`;
  }

  private async decrypt(data: string): Promise<string> {
    const [ivBase64, cipherBase64] = data.split(':');
    const iv = this.base64ToArrayBuffer(ivBase64);
    const cipher = this.base64ToArrayBuffer(cipherBase64);
    const key = await this.getKey();

    const plainBuffer = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher);
    return new TextDecoder().decode(plainBuffer);
  }

  private async getKey(): Promise<CryptoKey> {
    const enc = new TextEncoder().encode(this.encryptionKey);
    return crypto.subtle.importKey('raw', enc, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
  }


  private setKey(): void {
    this.encryptionKey = this.generateRandomKey();
  }

  private generateRandomKey(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }



  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    const binary = bytes.reduce((acc, b) => acc + String.fromCharCode(b), '');
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}
