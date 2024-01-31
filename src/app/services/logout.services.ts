// logout.service.ts
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { getAuth, signOut } from '@angular/fire/auth';
import {
  Firestore,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class LogoutService {
  constructor(
    private router: Router,
    private firestore: Firestore = inject(Firestore)
  ) {}

  async logOutUser() {
    const auth = getAuth();

    await this.setUserOffline(auth.currentUser?.uid);

    signOut(auth)
      .then(() => {
        console.log('Benutzer abgemeldet');
        localStorage.removeItem('loggedInUser');
        this.router.navigate(['/']);
      })
      .catch((error) => {
        console.error('Fehler beim Abmelden des Benutzers', error);
      });
  }

  private async setUserOffline(id: any) {
    const userProfileCollection = collection(this.firestore, 'users');
    const q = query(userProfileCollection, where('id', '==', id));
    try {
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userDocRef = doc(userProfileCollection, userDoc.id);
        await updateDoc(userDocRef, { isOnline: false });
      } else {
        console.log('User with ID not found');
      }
    } catch (error) {
      console.error('Error retrieving user documents:', error);
    }
  }
}
