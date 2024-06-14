import { Institution } from "./Institution";

export class Exame {
    id!: number;
    subject!: string;
    description!: string;
    fileName!: string;
    urlFile!: string;
    date!: Date;
    totalDownloadNumber!: string;
    institution = new Institution();
}