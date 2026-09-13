import * as admin from 'firebase-admin';

let firebaseApp: admin.app.App | null = null;

export function initFirebase() {
  if (firebaseApp) return firebaseApp;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const databaseURL = process.env.FIREBASE_DATABASE_URL;

  if (!projectId || !clientEmail || !privateKey || !databaseURL) {
    console.warn('[Firebase] Service credentials missing in environment. Live notification engine disabled.');
    return null;
  }

  try {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      databaseURL,
    });
    console.log('[Firebase] Admin SDK initialized successfully.');
    return firebaseApp;
  } catch (error) {
    console.error('[Firebase] Failed to initialize Admin SDK:', error);
    return null;
  }
}

export class FirebaseService {
  // Realtime Balance Sync to User App Node
  static async syncUserBalance(telegramId: number, newBalance: number) {
    if (!firebaseApp) return;
    try {
      const db = admin.database();
      await db.ref(`users/${telegramId}/balance`).set(newBalance);
    } catch (error) {
      console.error(`[Firebase Sync Error] Balance update failed for User ${telegramId}:`, error);
    }
  }

  // Push Live Toast Notifications to Customer Frontend
  static async sendNotification(
    telegramId: number,
    notification: { title: string; message: string; type: 'SUCCESS' | 'INFO' | 'WARNING' }
  ) {
    if (!firebaseApp) return;
    try {
      const db = admin.database();
      const newNotifRef = db.ref(`notifications/${telegramId}`).push();
      await newNotifRef.set({
        ...notification,
        read: false,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error(`[Firebase Notification Error] Push failed for User ${telegramId}:`, error);
    }
  }
}
