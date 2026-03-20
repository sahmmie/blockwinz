/**
 * Response shape from Mailgun's messages API (mirrors mailgun.js MessagesSendResult).
 */
export interface MailgunSendResult {
  id?: string;
  message?: string;
  status: number;
  details?: string;
}
