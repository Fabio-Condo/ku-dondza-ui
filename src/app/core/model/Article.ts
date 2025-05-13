import { Like } from "./Like";

export class Article {
  id!: number;
  articleId!: string;
  title!: string;
  content!: string;
  lastUpdated!: Date;
  date!: Date;
  readingTimeMinutes!: number;
  fileName!: string;
  urlFile!: string;
  category!: string;
  likes!: Like[];

  likedByUser: boolean = false;
  savedByUser: boolean = false;
  numberOfLikes: number = 0;

  isAdminMenuOpen: boolean = false;
  showLoadingLike: boolean = false;
  showLoadingSave: boolean = false;
} 