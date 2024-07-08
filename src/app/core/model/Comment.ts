import { Post } from "./Post";

export class Comment {
    id!: number;
    content!: string;
    parentCommentId!: number | null;
    post = new Post();
    replies: Comment[] = [];
    showReplyForm!: boolean;  // Novo campo adicionado
    replyContent!: string;    // Novo campo para armazenar o conteúdo da resposta
}
