import { OnlineCourseContent } from "./Online-course-content";

export class OnlineCourse {
    id!: number;
    name!: string;
    description!: string;
    fileName!: string;
    coverImageUrl!: string;
    requirements!: string;
    lunchDate!: string;
    instrutorName!: string;
    instrutorDescription!: string;
    instrutorSpecialization!: string;
    //content: OnlineCourseContent[] = [];


    isSubscribed: boolean = false;
    totalStudents: number = 0;
    isAdminMenuOpen: boolean = false;

}
