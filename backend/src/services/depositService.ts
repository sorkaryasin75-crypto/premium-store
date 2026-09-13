import { ObjectId } from 'mongodb';
import { getDB, withTransaction } from '../db';
import { DepositDocument } from '../db/models/Deposit';
import { UserDocument } from '../db/models/User';
import { SystemConfigDocument } from '../db/models/SystemConfig';
import { DepositStatus, PaymentGateway } from '@premium-store/shared';
import { FirebaseService } from './firebaseService';

export class DepositService {
  static async createDepositRequest(
    userId: string,
    amount: number,
    gateway: PaymentGateway,
    transactionId: string,
    senderNumber?: string
  ) {
    if (amount <= 0) {
      throw new Error('Deposit amount must be greater than zero');
    }

    const cleanTxnId = transactionId.trim().toUpperCase();
    const db = getDB();

    const existingDeposit = await db.collection<DepositDocument>('deposits').findOne({
      transactionId: cleanTxnId,
    });

    if (existingDeposit) {
      throw new Error('This Transaction ID has already been submitted or processed.');
    }

    const user = await db.collection<UserDocument>('users').findOne({ _id: new ObjectId(userId) });
    if (!user) {
      throw new Error('User not found');
    }

    const newDeposit: DepositDocument = {
      userId: user._id!,
      telegramId: user.telegramId,
      amount,
      gateway,
      transactionId: cleanTxnId,
      senderNumber: senderNumber?.trim(),
      status: DepositStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection<DepositDocument>('deposits').insertOne(newDeposit);
    return { ...newDeposit, _id: result.insertedId };
  }

  static async getUserDeposits(userId: string) {
    const db = getDB();
    return db
      .collection<DepositDocument>('deposits')
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray();
  }

  static async getPendingDeposits() {
    const db = getDB();
    return db
      .collection<DepositDocument>('deposits')
      .find({ status: DepositStatus.PENDING })
      .sort({ createdAt: 1 })
      .toArray();
  }

  // Admin Approve Deposit with Live Firebase Sync
  static async approveDeposit(depositId: string, adminUserId: string) {
    const result = await withTransaction(async (session) => {
      const db = getDB();
      const depObjId = new ObjectId(depositId);

      const deposit = await db
        .collection<DepositDocument>('deposits')
        .findOne({ _id: depObjId, status: DepositStatus.PENDING }, { session });

      if (!deposit) {
        throw new Error('Deposit request not found or already processed');
      }

      await db.collection<DepositDocument>('deposits').updateOne(
        { _id: depObjId },
        {
          $set: {
            status: DepositStatus.APPROVED,
            approvedBy: new ObjectId(adminUserId),
            updatedAt: new Date(),
          },
        },
        { session }
      );

      const updatedUser = await db.collection<UserDocument>('users').findOneAndUpdate(
        { _id: deposit.userId },
        { $inc: { balance: deposit.amount }, $set: { updatedAt: new Date() } },
        { session, returnDocument: 'after' }
      );

      return {
        success: true,
        amount: deposit.amount,
        userId: deposit.userId,
        telegramId: deposit.telegramId,
        newBalance: updatedUser?.balance ?? 0,
      };
    });

    // Fire & Forget Realtime Sync
    if (result.telegramId) {
      FirebaseService.syncUserBalance(result.telegramId, result.newBalance);
      FirebaseService.sendNotification(result.telegramId, {
        title: 'Deposit Approved! 🎉',
        message: `Your deposit of ৳${result.amount} has been approved. New balance: ৳${result.newBalance}`,
        type: 'SUCCESS',
      });
    }

    return result;
  }

  // Admin Reject Deposit with Live Firebase Notification
  static async rejectDeposit(depositId: string, rejectionReason?: string) {
    const db = getDB();
    const depObjId = new ObjectId(depositId);

    const deposit = await db.collection<DepositDocument>('deposits').findOne({ _id: depObjId });
    if (!deposit || deposit.status !== DepositStatus.PENDING) {
      throw new Error('Deposit request not found or already processed');
    }

    const reason = rejectionReason || 'Invalid Transaction ID or mismatching amount';

    await db.collection<DepositDocument>('deposits').updateOne(
      { _id: depObjId },
      {
        $set: {
          status: DepositStatus.REJECTED,
          rejectionReason: reason,
          updatedAt: new Date(),
        },
      }
    );

    // Live Notification Push
    if (deposit.telegramId) {
      FirebaseService.sendNotification(deposit.telegramId, {
        title: 'Deposit Rejected ❌',
        message: `Your deposit request for Txn ID ${deposit.transactionId} was rejected. Reason: ${reason}`,
        type: 'WARNING',
      });
    }

    return { success: true };
  }

  static async getPaymentMethods() {
    const db = getDB();
    const config = await db.collection<SystemConfigDocument>('system_config').findOne({});
    return config?.paymentMethods?.filter((m) => m.isActive) || [];
  }
}
