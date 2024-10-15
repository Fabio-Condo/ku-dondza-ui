import { Institution } from "./Institution";
import { Subject } from "./Subject";

export class Exam {
    id!: number;
    description: string = '';
    status!: string; // RESOLVED, UNRESOLVED
    fileName!: string;
    urlFile!: string;
    date!: Date;
    totalDownloadNumber!: string;
    institution = new Institution();
    subject = new Subject();
    showLoadingDownload: boolean = false;

}