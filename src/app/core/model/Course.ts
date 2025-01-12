import { Institution } from "./Institution";
import { CourseRequirement } from "./CourseRequirement";

export class Course {
    id!: number;
    name!: string;
    duration!: string;
    level!: string;
    institution = new Institution();
    requirements: CourseRequirement[] = [];

    isAdminMenuOpen: boolean = false;
}