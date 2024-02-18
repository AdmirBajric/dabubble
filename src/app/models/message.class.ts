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
  recipient?: User;
  reactions: Reaction[];
  isChannelMessage: boolean;
  edited: boolean;
  privateMsg: boolean;
  id?: string;
  file: string;

  constructor(obj?: any) {
    this.text = obj?.text || '';
    this.timestamp = obj?.timestamp ? new Date(obj.timestamp) : new Date();
    this.creator = obj && obj.creator ? new User(obj.creator) : new User();
    this.channelId = obj?.channelId || '';
    this.recipient = obj && obj.recipient ? new User(obj.recipient) : undefined;
    this.reactions = (obj?.reactions || []).map(
      (reaction: any) => new Reaction(reaction)
    );
    this.isChannelMessage = obj?.isChannelMessage || false;
    this.edited = obj ? obj.edited || false : false;
    this.privateMsg = obj?.privateMsg || false;
    this.file = obj?.file || '';
  }

  public toJSON() {
    const json: any = {
      text: this.text,
      timestamp: this.timestamp.toISOString(),
      creator: this.creator.toJSON(),
      channelId: this.channelId,
      reactions: this.reactions.map((reaction) => reaction.toJSON()),
      isChannelMessage: this.isChannelMessage,
      edited: this.edited,
      privateMsg: this.privateMsg,
      file: this.file,
    };

    if (this.recipient !== undefined) {
      json.recipient = this.recipient.toJSON();
    }

    return json;
  }

  public toString(): string {
    return JSON.stringify(this.toJSON(), null, 2);
  }
}
