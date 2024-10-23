import { Interest } from "./Interest";
import { Post } from "./Post";

export class User {
  public id!: number;
  public userId: string;
  public firstName: string;
  public lastName: string;
  public username: string;
  public bio: string;
  public email: string;
  public institution: string;
  public course: string;
  public lastLoginDate: any;  // Date;
  public lastLoginDateDisplay: any; // Date;
  public joinDate: any;  // Date;
  public profileImageUrl: string;
  public profileCoverImageUrl: string;
  public active: boolean;
  public notLocked: boolean;
  public role: string;
  public authorities: [];
  public interests: Interest[] = [];
  public savedPosts: Post[] = [];

  public isFriend: boolean = false;


  constructor() {

    this.userId = '';
    this.firstName = '';
    this.lastName = '';
    this.username = '';
    this.bio = '';
    this.email = '';
    this.institution = '';
    this.course = '';
    this.lastLoginDate = '';
    this.lastLoginDateDisplay = '';
    this.joinDate = '';
    this.profileImageUrl = '';
    this.profileCoverImageUrl = '';
    this.active = false;
    this.notLocked = false;
    this.role = '';
    this.authorities = [];
  }

}


