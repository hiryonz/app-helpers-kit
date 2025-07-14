import { inject, Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { BiometryType, NativeBiometric } from 'capacitor-native-biometric';
import { CredentialsStorageService } from './utils/credentials.storage.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { SimpleAlertService } from './utils/simple.alert.service';
import { firstValueFrom } from 'rxjs';

/**
 * BiometricService
 * ----------------
 * This Angular service handles biometric authentication (fingerprint) using the 
 * `capacitor-native-biometric` plugin, primarily for native platforms (Android/iOS).
 *
 * Core Responsibilities:
 * - Verifies if biometric authentication is available and enabled on the device.
 * - Prompts the user to authenticate with fingerprint (max 5 attempts).
 * - Retrieves stored credentials (username and token) upon successful verification.
 * - Validates the biometric token (JWE) against a backend endpoint.
 * - Persists validated credentials using `CredentialsStorageService`.
 *
 * Key Notes:
 * - Only works on mobile platforms (not available on web).
 * - Uses JWE tokens for validation. If this is not needed, the logic can be removed or refactored.
 * - The current logic returns a simple boolean result depending on biometric success/failure.
 * - Requires an endpoint `/user/testJwe` that accepts `{ token: string }` and returns a new valid token.
 *
 * Dependencies:
 * - Capacitor Native Biometric plugin
 * - Angular HttpClient
 * - RxJS (firstValueFrom)
 * - CredentialsStorageService (to store validated credentials locally)
 */

@Injectable({
  providedIn: 'root'
})
export class BiometricService {

  httpClient = inject(HttpClient);

  url: string = environment.API_URL_REG;
  payload: {} = {};

  constructor(
    private credentialStorage: CredentialsStorageService,
    private alert: SimpleAlertService
  ) {}

  async getBiometricVerification() {

    if( Capacitor.getPlatform() == "web" ) {
      console.log("No se puede levantar biometria")
      return false;
    }

    const result = await NativeBiometric.isAvailable();
    if(!result.isAvailable) {
      console.log("No esta disponible")
      return false;
    }

    if(result.biometryType != BiometryType.FINGERPRINT && result.biometryType !== BiometryType.MULTIPLE) {
      console.log("Fingerprint erroneo")
      return false;
    }

    const verified = await NativeBiometric.verifyIdentity({
      maxAttempts: 5
    })
    .then(() => true)
    .catch(() => false);

    if (!verified) {
      console.log("No estas verificado")
      return false;
    }

    const credentials = await NativeBiometric.getCredentials({
      server: 'taptap',
    });

    const validatedJwe = await this.validateJwe(credentials.password);

    if(!validatedJwe) { return false }
    
    await this.credentialStorage.saveCredentials(credentials.username, validatedJwe);

    return true;
  }


  //valiadte the jwe token in JWE
  async validateJwe(bioToken: string) {
        this.payload = {
          token: bioToken
        }
        try {
          const result: any = await firstValueFrom(this.httpClient.post<any>(
            `${this.url}/user/testJwe`,
            this.payload
          ));

          return result.token;
        } catch (error: any) {
          return false
        }
  }
}
