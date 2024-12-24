import { OnlineCourse } from "./Online-course";
import { OnlineCourseContent } from "./Online-course-content";

export class Tema {
    id!: number;
    name!: string;
    position!: number;
    onlineCourse = new OnlineCourse();
    courseContents: OnlineCourseContent[] = [];
}