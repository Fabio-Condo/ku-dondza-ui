import { OnlineCourseContent } from "./Online-course-content";
import { Question } from "./Question";
import { Tema } from "./Tema";

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
    temas: Tema[] = [];
    questions: Question[] = [];

    totalQuestions: number = 0;

    isSubscribed: boolean = false;
    totalStudents: number = 0;
    isAdminMenuOpen: boolean = false;

}
