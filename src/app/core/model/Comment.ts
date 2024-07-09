import { Post } from "./Post";
import { User } from "./User";

export class Comment {
    id!: number;
    content!: string;
    parentCommentId!: number | null;
    post = new Post();
    user!: User; 
    replies: Comment[] = [];
    showReplyForm!: boolean;  // Novo campo adicionado
    replyContent!: string;    // Novo campo para armazenar o conteúdo da resposta
}
