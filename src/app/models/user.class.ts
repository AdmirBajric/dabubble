export class User {
  id: string;
  fullName: string;
  email: string;
  password: string;
  avatar: string;
  isOnline: boolean;

  constructor(obj?: any) {
    (this.id = obj ? obj.id : undefined),
      (this.fullName = obj ? obj.fullName : '');
    this.email = obj ? obj.email : '';
    this.password = obj ? obj.password : '';
    this.avatar = obj ? obj.avatar : '';
    this.isOnline = obj ? obj.isOnline : false;
  }

  public toJSON() {
    return {
      id: this.id,
      fullName: this.fullName,
      email: this.email,
      password: this.password,
      avatar: this.avatar,
      isOnline: this.isOnline,
    };
  }
}
