import { User } from '../models/user.class';

export class Conversation {
  id: string;
  creator: User;
  users: string[];

  constructor(obj?: any) {
    this.id = obj && obj.id ? obj.id : '';
    this.creator = obj && obj.creator ? new User(obj.creator) : new User();
    this.users = obj && obj.users ? obj.users : [];
  }

  toJSON() {
    return {
      id: this.id,
      creator: this.creator.toJSON(),
      users: this.users,
    };
  }
}
