import mongoose, { Schema, Document } from 'mongoose';

export type PaymentType = 'certificate' | 'training_material' | 'bundle' | 'results';
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';
export type PaymentProvider = 'paystack' | 'flutterwave' | 'manual';

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  
  // What was paid for
  type: PaymentType;
  examId?: mongoose.Types.ObjectId;        // For certificate
  materialId?: mongoose.Types.ObjectId;    // For training material
  
  // Amount
  amount: number;                          // In kobo/cents
  currency: string;                        // NGN, USD, etc.
  
  // Provider details
  provider: PaymentProvider;
  providerReference: string;               // Paystack reference
  providerTransactionId?: string;
  
  // Status
  status: PaymentStatus;
  paidAt?: Date;
  failedAt?: Date;
  failureReason?: string;
  
  // Metadata
  metadata?: Record<string, any>;
  
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  
  type: { 
    type: String, 
    enum: ['certificate','results', 'training_material', 'bundle'], 
    required: true 
  },
  examId: { type: Schema.Types.ObjectId, ref: 'Exam' },
  materialId: { type: Schema.Types.ObjectId, ref: 'TrainingMaterial' },
  
  amount: { type: Number, required: true },
  currency: { type: String, default: 'NGN' },
  
  provider: { 
    type: String, 
    enum: ['paystack', 'flutterwave', 'manual'], 
    required: true 
  },
  providerReference: { type: String, required: true, unique: true },
  providerTransactionId: String,
  
  status: { 
    type: String, 
    enum: ['pending', 'success', 'failed', 'refunded'],
    default: 'pending',
    index: true 
  },
  paidAt: Date,
  failedAt: Date,
  failureReason: String,
  
  metadata: Schema.Types.Mixed,
}, { timestamps: true });

// Revenue analytics
PaymentSchema.index({ status: 1, createdAt: -1 });
PaymentSchema.index({ provider: 1, status: 1 });

export const Payment =
  mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
export default Payment;