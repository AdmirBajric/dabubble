import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { User } from '../models/user.class';
import { Conversation } from '../models/conversation.class';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-user-to-conversations',
  standalone: true,
  templateUrl: './add-user-to-conversations.component.html',
  styleUrls: ['./add-user-to-conversations.component.scss'],
  imports: [FormsModule],
})
export class AddUserToConversationsComponent implements OnInit {
  user: User | null = null;
  userToAdd: string = '';

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit() {
    const loggedInUser =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem('loggedInUser')
        : null;
    if (loggedInUser) {
      const parsedUser = JSON.parse(loggedInUser);
      this.user = parsedUser;
    }
  }

  async addUserToConversations(userToAdd: string) {
    try {
      if (!this.user) {
        return;
      }

      let filteredUser;
      await this.firebaseService.getAllUsers().then((users) => {
        users.filter((user) => {
          if (user['id'] === userToAdd) {
            filteredUser = user;
          }
        });
      });

      await this.createConversation(this.user, userToAdd);
      await this.createConversation(filteredUser, this.user.id);
    } catch (error: any) {
      // if (error.message.includes('No document to update')) {
      //   console.error(
      //     'Error: Conversation does not exist. Creating a new conversation.'
      //   );
      // } else {
      //   console.error('Error:', error.message);
      // }
    }

    // if (this.user) {
    //   const conversationInfo =
    //     await this.firebaseService.getConversationForUser(this.user.id);
    //   if (conversationInfo) {
    //     const { id: conversationId, data: conversation } = conversationInfo;
    //     await this.firebaseService.updateConversation(
    //       conversationId,
    //       conversation
    //     );
    //   }
    // }
  }

  async createConversation(user: any, userToAdd: any) {
    const conversation = await this.firebaseService.getConversationForUser(
      user.id
    );

    if (conversation) {
      if (conversation.data.creator.id === user.id) {
        if (!conversation.data.users.includes(userToAdd)) {
          conversation.data.users.push(userToAdd);

          await this.firebaseService.updateConversation(
            conversation.id,
            conversation.data
          );
          console.log('User added to conversation successfully.');
        } else {
          console.log('User is already in the conversation.');
        }
      } else {
        console.log(
          'Logged-in user is not the creator of the conversation. Cannot update.'
        );
      }
    } else {
      const newConversation = new Conversation({
        creator: user,
        users: [userToAdd],
      });

      await this.firebaseService.createConversation(newConversation);
      console.log('Conversation created successfully.');
    }
  }
}
