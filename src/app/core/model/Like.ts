import { Post } from "./Post";
import { User } from "./User";

export class Like { 
    id!: number;
    post!: Post; // Which post the is for
    user!: User; // Who made the like
}