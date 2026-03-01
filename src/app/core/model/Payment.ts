import { User } from "./User";
import { Wallet } from "./Wallet";

export class Payment {
  id!: number;
  user = new User();
  wallet = new Wallet();
  plan!: string; // FREE, PREMIUM
  status!: string; // SUCCESS, FAILED, PENDING
  amount!: number;
  createdAt!: Date;
  updatedAt!: Date;
  planExpiresAt!: Date;
  transactionId!: string;
  failureReason!: string;
}