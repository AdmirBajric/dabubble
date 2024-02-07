import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Firestore,
  collection,
  onSnapshot,
  collectionData,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-read-data',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './read-data.component.html',
  styleUrl: './read-data.component.scss',
})
export class ReadDataComponent implements OnInit {
  firestore: Firestore = inject(Firestore);
  items$: Observable<any[]>;

  constructor() {
    const aCollection = collection(this.firestore, 'channels');
    this.items$ = collectionData(aCollection);
  }

  ngOnInit() {
    try {
      const itemCollection = collection(this.firestore, 'channels');

      onSnapshot(itemCollection, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const channelId = doc.id;
          console.log(data);
          console.log(channelId);
        });
      });
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  }

  getObjectKeys(obj: any): string[] {
    return Object.keys(obj);
  }
}
