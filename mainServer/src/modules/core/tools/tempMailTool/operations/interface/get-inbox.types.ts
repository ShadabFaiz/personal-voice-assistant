export interface GetInboxParams {
  page?: number;
}

export interface InboxMessageData {
  id: string;
  accountId: string;
  msgid: string;
  from: {
    address: string;
    name: string;
  };
  to: Array<{
    address: string;
    name: string;
  }>;
  subject: string;
  intro: string;
  seen: boolean;
  isDeleted: boolean;
  hasAttachments: boolean;
  size: number;
  downloadUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetInboxResponse {
  status: boolean;
  operation: string;
  data?: InboxMessageData[];
  message?: string;
}
