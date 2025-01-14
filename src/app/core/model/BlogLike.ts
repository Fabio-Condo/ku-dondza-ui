import { Blog } from "./Blog";
import { Post } from "./Post";
import { User } from "./User";

export class BlogLike { 
    id!: number;
    post!: Blog; 
    user!: User; 
}