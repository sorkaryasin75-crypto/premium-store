import { getDB } from '../db';
import { TelegramUser } from '../middleware/validateTelegramInitData';
import { UserDocument } from '../db/models/User';
import { UserRole } from '@premium-store/shared';

export class AuthService {
  static async authenticateTelegramUser(tgUser: TelegramUser): Promise<UserDocument> {
    const db = getDB();
    const usersCollection = db.collection<UserDocument>('users');

    let user = await usersCollection.findOne({ telegramId: tgUser.id });

    if (!user) {
      const newUser: UserDocument = {
        telegramId: tgUser.id,
        firstName: tgUser.first_name,
        lastName: tgUser.last_name,
        username: tgUser.username,
        balance: 0,
        role: UserRole.USER,
        isBanned: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await usersCollection.insertOne(newUser);
      user = { ...newUser, _id: result.insertedId };
    } else {
      // Sync User details if changed
      await usersCollection.updateOne(
        { _id: user._id },
        {
          $set: {
            firstName: tgUser.first_name,
            lastName: tgUser.last_name,
            username: tgUser.username,
            updatedAt: new Date(),
          },
        }
      );
    }

    return user;
  }
}
