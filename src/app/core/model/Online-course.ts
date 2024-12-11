import { OnlineCourseContent } from "./Online-course-content";
import { Question } from "./Question";
import { Tema } from "./Tema";
import { User } from "./User";

export class OnlineCourse {
    id!: number;
    onlineCourseId!: string;
    name!: string;
    description!: string;
    fileName!: string;
    coverImageUrl!: string;
    requirements!: string;
    lunchDate!: string;
    instrutor = new User();
    temas: Tema[] = [];
    questions: Question[] = [];

    totalQuestions: number = 0;

    isSubscribed: boolean = false;
    totalStudents: number = 0;
    isAdminMenuOpen: boolean = false;

}
