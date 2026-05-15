// src/types/notification.types.ts
import type { UserSummary } from './user.types';
import type { Reel } from './reel.types';

export type NotificationType = 'like' | 'comment' | 'reply' | 'follow';

export interface Notification {
  _id: string;
  type: NotificationType;
  sender: UserSummary;
  reel?: Pick<Reel, '_id' | 'videoUrl'>;
  read: boolean;
  createdAt: string;
}
