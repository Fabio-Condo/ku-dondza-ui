import { OnlineCourseContent } from "./Online-course-content";
import { Question } from "./Question";
import { Module } from "./Module";
import { User } from "./User";
import { OnlineCourseRequirement } from "./OnlineCourseRequirement";

export class OnlineCourse {
    id!: number;
    onlineCourseId!: string;
    name!: string;
    description!: string;
    fileName!: string;
    coverImageUrl!: string;
    lunchDate!: string;
    instrutor = new User();
    modules: Module[] = [];
    questions: Question[] = [];

    totalQuestions: number = 0;

    isLiked: boolean = false;
    numberOfLikes: number = 0;

    currentUserSubscribed: boolean = false;
    totalStudents: number = 0;
    isAdminMenuOpen: boolean = false;

}
