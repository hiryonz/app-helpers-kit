import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { SimpleAlertService } from '../services/utils/simple.alert.service';
import { catchError } from 'rxjs';
import { CredentialsStorageService } from '../services/utils/credentials.storage.service';

/**
 * authInterceptor
 * ----------------------------
 * This HTTP interceptor handles global authorization errors (401 Unauthorized).
 * 
 * Functionality:
 * - Intercepts all HTTP responses using RxJS `catchError`.
 * - Detects if the error corresponds to an expired or invalid token.
 * - If detected:
 *    - Removes stored user email credentials.
 *    - Closes any active loading alert.
 *    - Displays an error alert informing the user their session has expired.
 *    - Redirects the user to the login page (`/tabs/login`).
 *
 * Notes:
 * - The interceptor uses Angular's `inject()` to get service instances at runtime.
 * - Token expiration is determined by the response status code or error message content.
 */


export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const alertService = inject(SimpleAlertService);
  const credentials = inject(CredentialsStorageService);


  return next(req).pipe(
    // manejo de error 401
    catchError(async error => {

      const message = error?.error?.message?.toLowerCase?.() || '';

      const isTokenExpired =
        error.status === 401 ||
        message.includes('invalid token') ||
        message.includes('expired');


      if (isTokenExpired) {
        credentials.removeEmailCredentials();
        alertService.closeLoadingAlert();
        await alertService.showErrorAlert("Ups, ocurrió un problema.", "Sesión expirada. Inicie sesión nuevamente.");
        router.navigateByUrl('/tabs/login');
      }
      throw error;
    })
  );
};
