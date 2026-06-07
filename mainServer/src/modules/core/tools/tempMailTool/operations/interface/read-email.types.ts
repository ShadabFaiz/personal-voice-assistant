export interface ReadEmailParams {
  emailId: string;
}

export interface ReadEmailMessageData {
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
  text: string;
  seen: boolean;
  hasAttachments: boolean;
  attachments: Array<{
    id: string;
    filename: string;
    contentType: string;
    downloadUrl: string;
  }>;
  size: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReadEmailResponse {
  status: boolean;
  operation: string;
  data?: ReadEmailMessageData;
  message?: string;
}
