import { z } from 'zod';

export const CreateOrderSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  couponCode: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

export const DepositWalletSchema = z.object({
  amount: z.number().positive('Deposit amount must be greater than zero'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  transactionReference: z.string().min(3, 'Transaction reference is required'),
});

export type DepositWalletInput = z.infer<typeof DepositWalletSchema>;

export const SupportTicketSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export type SupportTicketInput = z.infer<typeof SupportTicketSchema>;
