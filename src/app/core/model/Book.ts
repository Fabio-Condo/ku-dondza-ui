import { Subject } from "./Subject";

export class Book {
    id!: number;
    name!: string;
    description: string = '';
    fileName!: string;
    urlFile!: string;
    totalDownloadNumber!: string;
    subject = new Subject();

    showLoadingDownload: boolean = false;
    isAdminMenuOpen: boolean = false;
}