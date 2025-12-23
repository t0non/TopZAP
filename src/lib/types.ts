export type Contact = {
  id: string;
  name: string;
  phone: string;
  segment: 'VIP' | 'New' | 'Regular' | 'Inactive';
  createdAt: string;
  avatarUrl: string;
};

export type Campaign = {
  id: string;
  name: string;
  sentDate: string;
  status: 'Sent' | 'Scheduled' | 'Draft' | 'Failed';
  engagement: number;
  recipients: number;
};
