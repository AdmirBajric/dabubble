export class User {
  id: string;
  fullName: string;
  email: string;
  password: string;
  avatar: string;
  isOnline: boolean;

  constructor(obj?: any) {
    this.id = obj ? obj.id : undefined;
    this.fullName = obj ? obj.fullName : '';
    this.email = obj ? obj.email : '';
    this.password = obj ? obj.password : '';
    this.avatar = obj ? obj.avatar : '';
    this.isOnline = obj ? obj.isOnline : false;
  }

  public toJSON() {
    const userJson: any = {
      id: this.id,
      fullName: this.fullName,
      email: this.email,
      avatar: this.avatar,
      isOnline: this.isOnline,
    };

    if (this.password !== undefined) {
      userJson.password = this.password;
    }

    return userJson;
  }
}
