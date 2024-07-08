import { Institution } from "./Institution";
import { Subject } from "./Subject";

export class Exame {
    id!: number;
    //subject!: string;
    description: string = '';
    fileName!: string;
    urlFile!: string;
    date!: Date;
    totalDownloadNumber!: string;
    institution = new Institution();
    subject = new Subject();
    showLoadingDownload: boolean = false;

}