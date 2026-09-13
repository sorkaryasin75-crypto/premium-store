import { ObjectId } from 'mongodb';
import { getDB, withTransaction } from '../db';
import { DepositDocument } from '../db/models/Deposit';
import { UserDocument } from '../db/models/User';
import { SystemConfigDocument } from '../db/models/SystemConfig';
import { DepositStatus, PaymentGateway } from '@premium-store/shared';

export class DepositService {
  // Submit new manual deposit request
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

    // Check for duplicate Transaction ID
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

  // Get user deposit history
  static async getUserDeposits(userId: string) {
    const db = getDB();
    return db
      .collection<DepositDocument>('deposits')
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray();
  }

  // Admin: Get all pending deposit requests
  static async getPendingDeposits() {
    const db = getDB();
    return db
      .collection<DepositDocument>('deposits')
      .find({ status: DepositStatus.PENDING })
      .sort({ createdAt: 1 })
      .toArray();
  }

  // Admin: Approve deposit request with ACID Transaction balance update
  static async approveDeposit(depositId: string, adminUserId: string) {
    return withTransaction(async (session) => {
      const db = getDB();
      const depObjId = new ObjectId(depositId);

      const deposit = await db
        .collection<DepositDocument>('deposits')
        .findOne({ _id: depObjId, status: DepositStatus.PENDING }, { session });

      if (!deposit) {
        throw new Error('Deposit request not found or already processed');
      }

      // Update Deposit status
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

      // Increment User Balance
      await db.collection<UserDocument>('users').updateOne(
        { _id: deposit.userId },
        { $inc: { balance: deposit.amount }, $set: { updatedAt: new Date() } },
        { session }
      );

      return { success: true, amount: deposit.amount, userId: deposit.userId };
    });
  }

  // Admin: Reject deposit request
  static async rejectDeposit(depositId: string, rejectionReason?: string) {
    const db = getDB();
    const result = await db.collection<DepositDocument>('deposits').updateOne(
      { _id: new ObjectId(depositId), status: DepositStatus.PENDING },
      {
        $set: {
          status: DepositStatus.REJECTED,
          rejectionReason: rejectionReason || 'Invalid Transaction ID or mismatching amount',
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      throw new Error('Deposit request not found or already processed');
    }

    return { success: true };
  }

  // Get configured payment method numbers for customer
  static async getPaymentMethods() {
    const db = getDB();
    const config = await db.collection<SystemConfigDocument>('system_config').findOne({});
    return config?.paymentMethods?.filter((m) => m.isActive) || [];
  }
}
