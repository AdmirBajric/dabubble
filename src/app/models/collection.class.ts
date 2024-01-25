import { User } from './user.class';

export class Room {
  roomName: string;
  description: string;

  constructor(obj?: any) {
    this.roomName = obj ? obj.roomName : '';
    this.description = obj ? obj.description : '';
  }

  public toJSON() {
    return {
      roomName: this.roomName,
      description: this.description,
    };
  }
}

export class Message {
  sender: User;
  message: string;
  receiver: User;
  created_at: number;
  room: Room;
  reaction: Reaction[];

  constructor(obj?: any) {
    this.sender = obj ? new User(obj.sender) : new User();
    this.message = obj ? obj.message : '';
    this.receiver = obj ? new User(obj.receiver) : new User();
    this.created_at = obj ? obj.created_at : 0;
    this.room = obj ? new Room(obj.room) : new Room();
    this.reaction = obj
      ? obj.reaction.map((reaction: any) => new Reaction(reaction))
      : [];
  }

  public toJSON() {
    return {
      sender: this.sender,
      message: this.message,
      reciever: this.receiver,
      created_at: this.created_at,
      room: this.room,
      reaction: this.reaction,
    };
  }
}

export class Reaction {
  sender: User;
  message: string;

  constructor(obj?: any) {
    this.sender = obj ? obj.assignedTo.map((user: any) => new User(user)) : [];
    this.message = obj ? obj.message : '';
  }

  public toJSON() {
    return {
      sender: this.sender,
      message: this.message,
    };
  }
}
