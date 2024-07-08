export class Comment {
    id: number;
    content: string;
    postId: number;
    parentCommentId: number | null;
    replies: Comment[];
    showReplyForm: boolean;  // Novo campo adicionado
    replyContent: string;    // Novo campo para armazenar o conteúdo da resposta

    constructor(
        id: number = 0, 
        content: string = '', 
        postId: number = 0, 
        parentCommentId: number | null = null, 
        replies: Comment[] = [], 
        showReplyForm: boolean = false,
        replyContent: string = ''
    ) {
        this.id = id;
        this.content = content;
        this.postId = postId;
        this.parentCommentId = parentCommentId;
        this.replies = replies;
        this.showReplyForm = showReplyForm;
        this.replyContent = replyContent;
    }
}
