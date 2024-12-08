export class Institution {
    id!: number;
    institutionId!: string;
    name!: string;
    acronym!: string;
    type!: string;
    administrationType!: string;
    address!: string;
    website!: string;
    description!: string;
    fileName!: string;
    urlFile!: string;

    isAdminMenuOpen: boolean = false;
}