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
} from '@angular/fire/firestore';

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
      where(field, operator, value)
    );
    return await getDocs(queryRef);
  }
}
