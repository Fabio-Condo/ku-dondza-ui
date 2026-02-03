import { Subject } from "./Subject";

export class Exam {
    id!: number;
    examType!: string; // ENUNCIADO, RESOLUCAO
    institution!: string;
    premium: boolean = false;
    fileName!: string;
    urlFile!: string;
    date!: Date;
    totalDownloadNumber!: string;
    subject = new Subject();

    showLoadingDownload: boolean = false;
    isAdminMenuOpen: boolean = false;


}