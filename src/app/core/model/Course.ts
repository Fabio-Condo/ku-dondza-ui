import { Institution } from "./Institution";

export class Course {
    id!: number;
    name!: string;
    institution = new Institution();
}