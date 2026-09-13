import { ObjectId } from 'mongodb';

export interface PaymentMethodConfig {
  gateway: string;
  number: string;
  instruction: string;
  isActive: boolean;
}

export interface SystemConfigDocument {
  _id?: ObjectId;
  noticeBanner?: string;
  isMaintenanceMode: boolean;
  paymentMethods: PaymentMethodConfig[];
  updatedAt: Date;
}
