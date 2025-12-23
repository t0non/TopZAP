export type Contact = {
  id: string;
  name: string;
  phone: string;
  segment: 'Regular' | 'VIP' | 'Inactive' | 'New';
  createdAt: string;
  avatarUrl: string;
  birthday?: string;
};

export type Campaign = {
  id: string;
  name: string;
  sentDate: string;
  status: 'Sent' | 'Scheduled' | 'Draft' | 'Failed';
  engagement: number;
  recipients: number;
};
