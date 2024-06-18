
export class Post {
    public id!: number;
    public text: string;
    public type: string;
    public date: Date;
    public fileName!: string;
    public urlFile!: string;

    constructor() {
        this.text = '',
        this.type = ''
        this.date = new Date()
        this.fileName = '',
        this.urlFile = ''
    }

}