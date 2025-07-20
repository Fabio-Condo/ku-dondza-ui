import { User } from "./User";
import { Comment } from "./Comment";


export class CommentLike {
    id!: number;
    comment!: Comment;
    user!: User;
}