import { OnlineCourseContent } from "./Online-course-content";

export class OnlineCourse {
    id!: number;
    name!: string;
    description!: string;
    fileName!: string;
    coverImageUrl!: string;
    instrutor!: string;
    //content: OnlineCourseContent[] = [];

    isSubscribed: boolean = false;
    totalStudents: number = 0;
}
