import { Comment } from "./Comment";
import { Group } from "./Group";
import { Like } from "./Like";
import { PollOption } from "./PollOption";
import { User } from "./User";

export class Post {
    public id!: number;
    public text: string;
    public type: string;
    public date: Date;
    public fileName!: string;
    public urlFile!: string;
    public user: User;
    public group: Group;
    public pollOptions: PollOption[] = [];
    public comments: Comment[] = [];
    public likes: Like[] = [];

    public showInputComment!: boolean;
    public showComments!: boolean;
    public isLiked: boolean;  // Adiciona a propriedade isLiked
    public isSaved: boolean;
    public voted: boolean;
    public numberOfLikes: number;
    public numberOfComments: number;


    constructor() {
        this.text = '',
        this.type = ''
        this.date = new Date()
        this.fileName = '',
        this.urlFile = '',
        this.user = new User();
        this.group = new Group();
        this.showComments = false;
        this.isLiked = false;
        this.isSaved = false;
        this.voted = false;
        this.numberOfLikes = 0;
        this.numberOfComments = 0;
    }

}