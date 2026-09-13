import { ObjectId } from 'mongodb';
import { UserRole } from '@premium-store/shared';

export interface UserDocument {
  _id?: ObjectId;
  telegramId: number;
  firstName: string;
  lastName?: string;
  username?: string;
  balance: number;
  role: UserRole;
  isBanned: boolean;
  createdAt: Date;
  updatedAt: Date;
}
