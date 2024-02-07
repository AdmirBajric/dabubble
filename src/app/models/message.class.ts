import { User } from '../models/user.class';

export class Reaction {
  fullName: string;
  userId: string;
  emoji: string;

  constructor(obj?: any) {
    (this.fullName = obj ? obj.fullName : ''),
      (this.userId = obj ? obj.userId : '');
    this.emoji = obj ? obj.emoji : '';
  }

  public toJSON() {
    return {
      fullName: this.fullName,
      userId: this.userId,
      emoji: this.emoji,
    };
  }
}

export class Comment {
  text: string;
  timestamp: Date;
  creator: User;
  reactions: Reaction[];
  messageId: string;

  constructor(obj?: any) {
    this.text = obj?.text || '';
    this.timestamp = obj?.timestamp ? new Date(obj.timestamp) : new Date();
    this.creator = obj && obj.creator ? new User(obj.creator) : new User();
    this.reactions = (obj?.reactions || []).map(
      (reaction: any) => new Reaction(reaction)
    );
    this.messageId = obj?.messageId || '';
  }

  public toJSON() {
    return {
      text: this.text,
      timestamp: this.timestamp.toISOString(),
      creator: this.creator.toJSON(),
      reactions: this.reactions.map((reaction) => reaction.toJSON()),
      messageId: this.messageId,
    };
  }
}

export class Message {
  text: string;
  timestamp: Date;
  creator: User;
  channelId: string;
  reactions: Reaction[];

  constructor(obj?: any) {
    this.text = obj?.text || '';
    this.timestamp = obj?.timestamp ? new Date(obj.timestamp) : new Date();
    this.creator = obj && obj.creator ? new User(obj.creator) : new User();
    this.channelId = obj?.channelId || '';
    this.reactions = (obj?.reactions || []).map(
      (reaction: any) => new Reaction(reaction)
    );
  }

  public toJSON() {
    return {
      text: this.text,
      timestamp: this.timestamp.toISOString(),
      creator: this.creator.toJSON(),
      channelId: this.channelId,
      reactions: this.reactions.map((reaction) => reaction.toJSON()),
    };
  }
}
