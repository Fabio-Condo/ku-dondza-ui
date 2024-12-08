import { User } from "./User";

export class Group {
    id!: number;
    groupId!: string;
    name!: string;
    description!: string;
    fileName!: string;
    urlFile!: string;
    creator = new User();

    isCurrentUserMember: boolean = false
    totalMembers: number = 0;
    isAdminMenuOpen: boolean = false;
}