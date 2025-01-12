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
    requirements: OnlineCourseRequirement[] = [];
    questions: Question[] = [];

    totalQuestions: number = 0;

    isSubscribed: boolean = false;
    totalStudents: number = 0;
    isAdminMenuOpen: boolean = false;

}
