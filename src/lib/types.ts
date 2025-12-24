export type Contact = {
  id: string;
  userId: string;
  name: string;
  phone: string;
  segment: 'Regular' | 'VIP' | 'Inactive' | 'New';
  createdAt: any; // Can be string or Firestore Timestamp
  avatarUrl?: string;
  birthday?: string;
};

export type Campaign = {
  id: string;
  userId: string;
  name: string;
  sentDate: string;
  status: 'Sent' | 'Scheduled' | 'Draft' | 'Failed';
  engagement: number;
  recipients: number;
};
