import { Subject } from "./Subject";

export class Teacher {
    id!: number;
    name!: string;
    email!: string;
    contactNumber!: string;
    fileName!: string;
    urlFile!: string;
    subjects: Subject[] = [];
}