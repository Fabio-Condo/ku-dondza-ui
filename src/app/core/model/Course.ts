import { Question } from "./Question";
import { Module } from "./Module";
import { User } from "./User";

export class Course {
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
    totalStudents!: number;

    totalQuestions: number = 0;

    isLiked: boolean = false;
    numberOfLikes: number = 0;

    currentUserSubscribed: boolean = false;
    isAdminMenuOpen: boolean = false;
    showLoadingSubscription: boolean = false;

}
