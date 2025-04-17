import { OnlineCourse } from "./Course";
import { User } from "./User";

export class OnlineCourseLike { 
    id!: number;
    onlineCourse!: OnlineCourse; 
    user!: User; 
}