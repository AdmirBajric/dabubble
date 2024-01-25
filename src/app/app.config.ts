import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    importProvidersFrom([BrowserAnimationsModule]),
    importProvidersFrom(
      provideFirebaseApp(() =>
        initializeApp({
          projectId: 'dabubble-cee4e',
          appId: '1:354303596585:web:1df9a85618b4ab8929e438',
          storageBucket: 'dabubble-cee4e.appspot.com',
          apiKey: 'AIzaSyDCeSZwyHF4eihdWpzsJOlbJNR7YEVDFVI',
          authDomain: 'dabubble-cee4e.firebaseapp.com',
          messagingSenderId: '354303596585',
        })
      )
    ),
    importProvidersFrom(provideAuth(() => getAuth())),
    importProvidersFrom(provideFirestore(() => getFirestore())),
    importProvidersFrom(provideDatabase(() => getDatabase())),
  ],
};
