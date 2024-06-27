import { Institution } from "./Institution";

export class Course {
    id!: number;
    name!: string;
    duration!: string;
    requirements!: string;
    institution = new Institution();
}