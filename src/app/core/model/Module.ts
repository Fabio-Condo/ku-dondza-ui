import { Course } from "./Course";
import { OnlineCourseContent } from "./Online-course-content";

export class Module {
    id!: number;
    name!: string;
    position!: number;
    onlineCourse = new Course();
    contents: OnlineCourseContent[] = [];
}