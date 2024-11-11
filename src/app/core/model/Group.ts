export class Group {
    id!: number;
    name!: string;
    description!: string;
    fileName!: string;
    urlFile!: string;

    isMember: boolean = false
    totalMembers: number = 0;
    isAdminMenuOpen: boolean = false;
}