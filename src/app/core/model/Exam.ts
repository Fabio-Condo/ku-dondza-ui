import { Institution } from "./Institution";
import { Subject } from "./Subject";

export class Exam {
    id!: number;
    description: string = '';
    examType!: string; // ENUNCIADO, RESOLUCAO
    fileName!: string;
    urlFile!: string;
    date!: Date;
    totalDownloadNumber!: string;
    institution = new Institution();
    subject = new Subject();

    showLoadingDownload: boolean = false;
    isAdminMenuOpen: boolean = false;


}