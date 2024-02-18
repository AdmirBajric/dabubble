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
  setDoc,
  deleteDoc,
} from '@angular/fire/firestore';
import { User } from '../models/user.class';
import { Conversation } from '../models/conversation.class';
import { Subject } from 'rxjs';

interface ConversationData {
  id: string;
  users: string[];
}

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  firestore: Firestore = inject(Firestore);

  private conversationUpdateSubject: Subject<{
    id: string;
    data: Conversation;
  }>;

  constructor() {
    this.conversationUpdateSubject = new Subject<{
      id: string;
      data: Conversation;
    }>();
  }

  async createConversation(conversation: Conversation) {
    if (!this.firestore) {
      throw new Error('Firestore is not initialized.');
    }
    const conversationsCollection = collection(this.firestore, 'conversations');
    await addDoc(conversationsCollection, conversation.toJSON());
  }

  async updateConversation(conversationId: string, conversation: Conversation) {
    if (!this.firestore) {
      throw new Error('Firestore is not initialized.');
    }

    const conversationRef = doc(
      collection(this.firestore, 'conversations'),
      conversationId
    );
    await updateDoc(conversationRef, { ...conversation });
  }

  async getConversationForUser(
    userId: string
  ): Promise<{ id: string; data: Conversation } | null> {
    if (!this.firestore) {
      throw new Error('Firestore is not initialized.');
    }

    try {
      const conversationsCollection = collection(
        this.firestore,
        'conversations'
      );
      const querySnapshot = await getDocs(
        query(conversationsCollection, where('creator.id', '==', userId))
      );

      if (!querySnapshot.empty) {
        const conversationDoc = querySnapshot.docs[0];
        const conversationId = conversationDoc.id;

        onSnapshot(doc(conversationsCollection, conversationId), (snapshot) => {
          if (snapshot.exists()) {
            const updatedConversation = snapshot.data() as Conversation;
            this.conversationUpdateSubject.next({
              id: conversationId,
              data: updatedConversation,
            });
          } else {
            this.conversationUpdateSubject.next({
              id: conversationId,
              data: null,
            } as any);
          }
        });

        return {
          id: conversationId,
          data: conversationDoc.data() as Conversation,
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
      return null;
    }
  }

  subscribeToConversationUpdates() {
    return this.conversationUpdateSubject.asObservable();
  }

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

  async getDocuments(collectionName: string): Promise<ConversationData[]> {
    if (!this.firestore) {
      throw new Error('Firestore is not initialized.');
    }
    const collectionRef = collection(this.firestore, collectionName);
    const snapshot = await getDocs(collectionRef);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        users: data['users'],
      };
    });
  }

  async updateDocument(
    collectionName: string,
    documentId: string,
    data: any,
    merge = false
  ) {
    if (!this.firestore) {
      throw new Error('Firestore is not initialized.');
    }
    const documentRef = doc(
      collection(this.firestore, collectionName),
      documentId
    );
    return await updateDoc(documentRef, data, { merge });
  }

  async deleteChannel(channelId: string): Promise<void> {
    try {
      if (!this.firestore) {
        throw new Error('Firestore is not initialized.');
      }

      const channelRef = doc(collection(this.firestore, 'channels'), channelId);
      await deleteDoc(channelRef);
    } catch (error) {
      console.error('Error deleting channel:', error);
      throw error;
    }
  }

  async removeMemberFromChannel(
    channelId: string,
    memberId: string
  ): Promise<void> {
    try {
      if (!this.firestore) {
        throw new Error('Firestore is not initialized.');
      }

      // Get the channel document
      const channelRef = doc(collection(this.firestore, 'channels'), channelId);
      const channelSnapshot = await getDoc(channelRef);

      if (!channelSnapshot.exists()) {
        throw new Error('Channel not found.');
      }

      const channelData = channelSnapshot.data();
      if (!channelData || !Array.isArray(channelData['members'])) {
        throw new Error('Invalid channel data.');
      }

      // Find the index of the member in the members array
      const memberIndex = channelData['members'].indexOf(memberId);

      if (memberIndex === -1) {
        throw new Error('Member not found in channel.');
      }

      // Remove the member from the array
      channelData['members'].splice(memberIndex, 1);

      // Update the channel document in Firestore
      await updateDoc(channelRef, { members: channelData['members'] });
    } catch (error) {
      console.error('Error removing member from channel:', error);
      throw error; // Optionally handle or rethrow the error
    }
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

    let queryRef;

    if (loggedUser.id !== recipient.id) {
      queryRef = query(
        collection(this.firestore, 'messages'),
        where('isChannelMessage', '==', channel),
        where('creator.id', '==', loggedUser.id),
        where('recipient.id', '==', recipient.id),
        orderBy('timestamp')
      );
    } else {
      queryRef = query(
        collection(this.firestore, 'messages'),
        where('isChannelMessage', '==', channel),
        where('creator.id', 'in', [loggedUser.id, recipient.id]),
        where('recipient.id', 'in', [loggedUser.id, recipient.id]),
        orderBy('timestamp')
      );
    }

    const querySnapshot: QuerySnapshot = await getDocs(queryRef);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      data['timestamp'] = this.formatTimestamp(data['timestamp']);
      return data;
    });
  }

  formatTimestamp(timestamp: any): string {
    let date;
    if (timestamp instanceof Date) {
      date = timestamp;
    } else {
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

    let queryRef;

    if (loggedUser.id === recipient.id) {
      queryRef = query(
        collection(this.firestore, 'messages'),
        where('isChannelMessage', '==', channel),
        where('creator.id', '==', loggedUser.id),
        where('recipient.id', '==', recipient.id),
        where('privateMsg', '==', true),
        orderBy('timestamp')
      );
    } else {
      queryRef = query(
        collection(this.firestore, 'messages'),
        where('isChannelMessage', '==', channel),
        where('creator.id', 'in', [loggedUser.id, recipient.id]),
        where('recipient.id', 'in', [loggedUser.id, recipient.id]),
        where('privateMsg', '==', false),
        orderBy('timestamp')
      );
    }

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
