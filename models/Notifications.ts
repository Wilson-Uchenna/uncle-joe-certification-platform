import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType = 
  | 'registration' 
  | 'exam_reminder' 
  | 'result_available'
  | 'certificate_pending'
  | 'final_qualification'
  | 'winner_announcement'
  | 'challenge_reminder'
  | 'system';

export type NotificationChannel = 'email' | 'sms' | 'push' | 'in_app';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  
  type: NotificationType;
  title: string;
  message: string;
  
  // Delivery
  channels: NotificationChannel[];
  emailSent: boolean;
  emailSentAt?: Date;
  smsSent: boolean;
  smsSentAt?: Date;
  inAppDelivered: boolean;
  inAppDeliveredAt?: Date;
  
  // Tracking
  opened: boolean;
  openedAt?: Date;
  clicked: boolean;
  clickedAt?: Date;
  
  // Content
  actionUrl?: string;                      // Link to result, certificate, etc.
  metadata?: Record<string, any>;
  
  // Scheduling
  scheduledFor?: Date;
  sentAt?: Date;
  
  // User control
  isRead: boolean;
  readAt?: Date;
  
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  
  type: { 
    type: String, 
    enum: ['registration', 'exam_reminder', 'result_available', 'certificate_pending', 'final_qualification', 'winner_announcement', 'challenge_reminder', 'system'],
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  
  channels: [{ 
    type: String, 
    enum: ['email', 'sms', 'push', 'in_app'] 
  }],
  emailSent: { type: Boolean, default: false },
  emailSentAt: Date,
  smsSent: { type: Boolean, default: false },
  smsSentAt: Date,
  inAppDelivered: { type: Boolean, default: false },
  inAppDeliveredAt: Date,
  
  opened: { type: Boolean, default: false },
  openedAt: Date,
  clicked: { type: Boolean, default: false },
  clickedAt: Date,
  
  actionUrl: String,
  metadata: Schema.Types.Mixed,
  
  scheduledFor: Date,
  sentAt: Date,
  
  isRead: { type: Boolean, default: false },
  readAt: Date,
}, { timestamps: true });

// Query patterns
NotificationSchema.index({ betterAuthUserId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ type: 1, emailSent: 1, scheduledFor: 1 });
NotificationSchema.index({ emailSent: 1, sentAt: 1 });

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);