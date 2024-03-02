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

  /**
   * Logs out the currently authenticated user from the application:
   * 1. Sets the user's status to offline by calling `setUserOffline` with the current user's ID.
   * 2. Signs out the user from Firebase Authentication.
   * 3. After successful sign-out, it clears the 'loggedInUser' item from the local storage.
   * 4. Navigates back to login-/sign-up page.
   * @async
   * @returns {*}
   */
  async logOutUser() {
    const auth = getAuth();
    await this.setUserOffline(auth.currentUser?.uid);
    signOut(auth)
      .then(() => {
        console.log('Benutzer abgemeldet');
        localStorage.removeItem('loggedInUser');
        this.router.navigateByUrl('/', { replaceUrl: true }).then(() => {
          window.location.reload();
        });
      })
      .catch((error) => {
        console.error('Fehler beim Abmelden des Benutzers', error);
      });
  }

  /**
   * Sets a user's online status to offline in the Firestore database.
   * Logs a message if the user with the specified ID is not found and logs an error if there's an issue retrieving user documents.
   * @private
   * @async
   * @param {*} id - identifier for the user. The type is 'any' to accommodate various ID formats, but typically a string.
   */
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
