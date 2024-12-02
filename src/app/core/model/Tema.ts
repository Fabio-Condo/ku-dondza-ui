import { OnlineCourse } from "./Online-course";
import { OnlineCourseContent } from "./Online-course-content";

export class Tema {
    id!: number;
    name!: string;
    onlineCourse = new OnlineCourse();
    courseContents: OnlineCourseContent[] = [];
}