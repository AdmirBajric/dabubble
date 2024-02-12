import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  getDoc,
  query,
  where,
  getDocs,
  QuerySnapshot,
  onSnapshot,
  orderBy,
} from '@angular/fire/firestore';
import { User } from '../models/user.class';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  firestore: Firestore = inject(Firestore);

  constructor() {}

  async addDocument(collectionName: string, data: any) {
    if (!this.firestore) {
      throw new Error('Firestore is not initialized.');
    }
    return await addDoc(collection(this.firestore, collectionName), data);
  }

  async getDocument(collectionName: string, documentId: string) {
    if (!this.firestore) {
      throw new Error('Firestore is not initialized.');
    }
    const documentRef = doc(
      collection(this.firestore, collectionName),
      documentId
    );
    return await getDoc(documentRef);
  }

  async updateDocument(collectionName: string, documentId: string, data: any) {
    if (!this.firestore) {
      throw new Error('Firestore is not initialized.');
    }
    const documentRef = doc(
      collection(this.firestore, collectionName),
      documentId
    );
    return await updateDoc(documentRef, data);
  }

  async queryDocuments(
    collectionName: string,
    field: string,
    operator: any,
    value: any
  ) {
    if (!this.firestore) {
      throw new Error('Firestore is not initialized.');
    }
    const queryRef = query(
      collection(this.firestore, collectionName),
      where(field, operator, value),
      orderBy('timestamp')
    );
    return await getDocs(queryRef);
  }

  async getAllUsers() {
    if (!this.firestore) {
      throw new Error('Firestore is not initialized.');
    }
    const usersCollection = collection(this.firestore, 'users');
    const snapshot = await getDocs(usersCollection);
    return snapshot.docs.map((doc) => doc.data());
  }

  async getAllChannels() {
    if (!this.firestore) {
      throw new Error('Firestore is not initialized.');
    }
    const channelsCollection = collection(this.firestore, 'channels');
    const snapshot = await getDocs(channelsCollection);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      data['id'] = doc.id;
      return data;
    });
  }

  async searchMessages(
    channel: boolean,
    recipient: User,
    loggedUser: User
  ): Promise<any[]> {
    if (!this.firestore) {
      throw new Error('Firestore is not initialized.');
    }

    const queryRef = query(
      collection(this.firestore, 'messages'),
      where('isChannelMessage', '==', channel),
      where('creator.id', 'in', [loggedUser.id, recipient.id]),
      where('recipient.id', 'in', [loggedUser.id, recipient.id]),
      orderBy('timestamp')
    );

    const querySnapshot: QuerySnapshot = await getDocs(queryRef);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      data['timestamp'] = this.formatTimestamp(data['timestamp']); // Convert timestamp
      return data;
    });
  }

  formatTimestamp(timestamp: any): string {
    let date;
    if (timestamp instanceof Date) {
      date = timestamp; // If timestamp is already a Date object
    } else {
      // If timestamp is not a Date object, assume it's a string
      date = new Date(timestamp);
    }
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes} Uhr`;
  }

  searchMessagesRealTime(
    channel: boolean,
    recipient: User,
    loggedUser: User,
    callback: (messages: any[]) => void
  ) {
    if (!this.firestore) {
      throw new Error('Firestore is not initialized.');
    }

    const queryRef = query(
      collection(this.firestore, 'messages'),
      where('isChannelMessage', '==', channel),
      where('creator.id', 'in', [loggedUser.id, recipient.id]),
      where('recipient.id', 'in', [loggedUser.id, recipient.id]),
      orderBy('timestamp')
    );

    const unsubscribe = onSnapshot(queryRef, (snapshot) => {
      const messages = snapshot.docs.map((doc) => {
        const data = doc.data();
        data['timestamp'] = this.formatTimestamp(data['timestamp']);
        return {
          message: data,
          id: doc.id,
        };
      });
      callback(messages);
    });

    return unsubscribe;
  }

  listenForRealTimeComments(
    messageId: string,
    callback: (comments: any[]) => void
  ) {
    const queryRef = query(
      collection(this.firestore, 'comments'),
      where('messageId', '==', messageId),
      orderBy('timestamp')
    );

    const unsubscribe = onSnapshot(queryRef, (snapshot) => {
      const comments = snapshot.docs.map((doc) => {
        const data = doc.data();
        data['id'] = doc.id;
        return data;
      });
      callback(comments);
    });

    return unsubscribe;
  }
}
