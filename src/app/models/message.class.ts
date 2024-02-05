import { User } from '../models/user.class';

export class Reaction {
  userId: string;
  emoji: string;

  constructor(obj?: any) {
    this.userId = obj ? obj.userId : '';
    this.emoji = obj ? obj.emoji : '';
  }

  public toJSON() {
    return {
      userId: this.userId,
      emoji: this.emoji,
    };
  }
}

export class Comment {
  text: string;
  timestamp: Date;
  userId: string;
  reactions: Reaction[];

  constructor(obj?: any) {
    this.text = obj ? obj.text : '';
    this.timestamp = obj && obj.timestamp ? new Date(obj.timestamp) : new Date();
    this.userId = obj ? obj.userId : '';
    this.reactions = obj && obj.reactions ? obj.reactions.map((reaction: any) => new Reaction(reaction)) : [];
  }

  public toJSON() {
    return {
      text: this.text,
      timestamp: this.timestamp.toISOString(),
      userId: this.userId,
      reactions: this.reactions.map(reaction => reaction.toJSON()),
    };
  }
}

export class Message {
  text: string;
  timestamp: Date;
  userId: string;
  channelId: string;
  reactions: Reaction[];
  comments: Comment[];

  constructor(obj?: any) {
    this.text = obj ? obj.text : '';
    this.timestamp = obj && obj.timestamp ? new Date(obj.timestamp) : new Date();
    this.userId = obj ? obj.userId : '';
    this.channelId = obj ? obj.channelId : '';
    this.reactions = obj && obj.reactions ? obj.reactions.map((reaction: any) => new Reaction(reaction)) : [];
    this.comments = obj && obj.comments ? obj.comments.map((comment: any) => new Comment(comment)) : [];
  }

  public toJSON() {
    return {
      text: this.text,
      timestamp: this.timestamp.toISOString(),
      userId: this.userId,
      channelId: this.channelId,
      reactions: this.reactions.map(reaction => reaction.toJSON()),
      comments: this.comments.map(comment => comment.toJSON()),
    };
  }
}

