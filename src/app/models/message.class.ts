import { User } from '../models/user.class';

export class Reaction {
  fullName: string;
  userId: string;
  emoji: string;

  constructor(obj?: any) {
    this.fullName = obj ? obj.fullName : '';
    this.userId = obj ? obj.userId : '';
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
  isChannelMessage: boolean;
  edited: boolean;

  constructor(obj?: any) {
    this.text = obj?.text || '';
    this.timestamp = obj?.timestamp ? new Date(obj.timestamp) : new Date();
    this.creator = obj && obj.creator ? new User(obj.creator) : new User();
    this.reactions = (obj?.reactions || []).map(
      (reaction: any) => new Reaction(reaction)
    );
    this.messageId = obj?.messageId || '';
    this.isChannelMessage = obj?.isChannelMessage || false;
    this.edited = obj ? obj.edited || false : false;
  }

  public toJSON() {
    return {
      text: this.text,
      timestamp: this.timestamp.toISOString(),
      creator: this.creator.toJSON(),
      reactions: this.reactions.map((reaction) => reaction.toJSON()),
      messageId: this.messageId,
      isChannelMessage: this.isChannelMessage,
      edited: this.edited,
    };
  }
}

export class Message {
  text: string;
  timestamp: Date;
  creator: User;
  channelId?: string;
  recipientId?: string;
  reactions: Reaction[];
  isChannelMessage: boolean;
  edited: boolean;
  id?: string;

  constructor(obj?: any) {
    this.text = obj?.text || '';
    this.timestamp = obj?.timestamp ? new Date(obj.timestamp) : new Date();
    this.creator = obj && obj.creator ? new User(obj.creator) : new User();
    this.channelId = obj?.channelId || '';
    this.recipientId = obj?.recipientId || '';
    this.reactions = (obj?.reactions || []).map(
      (reaction: any) => new Reaction(reaction)
    );
    this.isChannelMessage = obj?.isChannelMessage || false;
    this.edited = obj ? obj.edited || false : false;
  }

  public toJSON() {
    return {
      text: this.text,
      timestamp: this.timestamp.toISOString(),
      creator: this.creator.toJSON(),
      channelId: this.channelId,
      recipientId: this.recipientId,
      reactions: this.reactions.map((reaction) => reaction.toJSON()),
      isChannelMessage: this.isChannelMessage,
      edited: this.edited,
    };
  }
}
