import { Subject } from "./Subject";

export class User {
  public id!: number;
  public userId: string;
  public fullName: string;
  public email: string;
  public bio: string;
  public lastLoginDate: any;  // Date;
  public lastLoginDateDisplay: any; // Date;
  public joinDate: any;  // Date;
  public profileImageUrl: string;
  public profileCoverImageUrl: string;
  public active: boolean;
  public notLocked: boolean;
  public userType!: string;
  public role: string;
  public plan: string;
  public planExpiresAt!: Date;
  public authorities: [];
  public subjectsInterests: Subject[] = [];
  public markedContentRate: number;
  public allowedUser: boolean;

  //public isFriend: boolean = false;
  //public currentUserSentFriendRequest: boolean = false;
  //public sentFriendRequest: boolean = false;

  //public isGroupAdmin: boolean = false

  public isAdminMenuOpen: boolean = false;
  
  constructor() {
    this.id = 0;
    this.userId = '';
    this.fullName = '';
    this.email = '';
    this.bio = '';
    this.lastLoginDate = '';
    this.lastLoginDateDisplay = '';
    this.joinDate = '';
    this.profileImageUrl = '';
    this.profileCoverImageUrl = '';
    this.active = false;
    this.notLocked = false;
    this.role = '';
    this.plan = '';
    this.authorities = [];
    this.markedContentRate = 0;
    this.allowedUser = false;
  }

}


