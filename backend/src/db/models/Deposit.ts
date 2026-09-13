import { ObjectId } from 'mongodb';
import { DepositStatus, PaymentGateway } from '@premium-store/shared';

export interface DepositDocument {
  _id?: ObjectId;
  userId: ObjectId;
  telegramId: number;
  amount: number;
  gateway: PaymentGateway; // BKASH, NAGAD, ROCKET, MANUAL
  transactionId: string;
  senderNumber?: string;
  status: DepositStatus; // PENDING, APPROVED, REJECTED
  approvedBy?: ObjectId;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}
