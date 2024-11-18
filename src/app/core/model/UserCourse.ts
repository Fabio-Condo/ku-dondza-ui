import { Course } from "./Course";
import { User } from "./User";

export class UserCourse {
    id!: number;
    user = new User();
    course = new Course();
    startDate!: Date;
}