import { User } from '../models/user.class';

export class Channel {
  name: string;
  description: string;
  creator: User;
  members: User[];

  constructor(obj?: any) {
    this.name = obj ? obj.name : '';
    this.description = obj ? obj.description : ''; 
    this.creator = obj && obj.creator ? new User(obj.creator) : new User();
    this.members =
      obj && obj.members
        ? obj.members.map((member: any) => new User(member))
        : [];
  }

  addMember(user: User): void {
    this.members.push(user);
  }

  removeMember(user: User): void {
    const index = this.members.indexOf(user);
    if (index !== -1) {
      this.members.splice(index, 1);
    }
  }

  public toJSON() {
    return {
      name: this.name,
      description: this.description,
      creator: this.creator.toJSON(),
      members: this.members.map((member) => member.toJSON()),
    };
  }
}
