import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Mailgun from 'mailgun.js';
import FormData from 'form-data';
import type { IMailgunClient } from 'mailgun.js/Interfaces/MailgunClient/IMailgunClient';
import { passwordResetTemplate } from './templates/password-reset-template';
import { emailVerificationTemplate } from './templates/register-template';
import { resendEmailVerificationTemplate } from './templates/verify-email-template';
import { EmailQueueRepository } from 'src/core/queue/repositories/emailQueue.repository';
import { MailgunSendResult } from './email.types';

/** Default Mailgun REST base (US). EU: set MAILGUN_API_URL=https://api.eu.mailgun.net */
const MAILGUN_DEFAULT_API_URL = 'https://api.mailgun.net';

/**
 * Sends transactional email via Mailgun HTTP API.
 * Queued flows use Bull; the processor calls {@link EmailService.sendEmailDirect}.
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly mailgunClient: IMailgunClient;
  private readonly mailgunDomain: string;

  constructor(
    private configService: ConfigService,
    private emailQueueRepository: EmailQueueRepository,
  ) {
    const apiKey = this.configService.get<string>('MAILGUN_API_KEY') ?? '';
    const url =
      this.configService.get<string>('MAILGUN_API_URL') ??
      MAILGUN_DEFAULT_API_URL;
    const mailgun = new Mailgun(FormData);
    this.mailgunClient = mailgun.client({
      username: 'api',
      key: apiKey,
      url,
    });
    this.mailgunDomain = this.configService.get<string>('MAILGUN_DOMAIN') ?? '';
  }

  /**
   * Sends one HTML email immediately (used by the email queue worker).
   */
  public async sendEmailDirect(
    to: string,
    subject: string,
    html: string,
  ): Promise<MailgunSendResult> {
    const apiKey = this.configService.get<string>('MAILGUN_API_KEY');
    const from = this.configService.get<string>('MAILGUN_FROM');
    if (!apiKey) {
      throw new Error('MAILGUN_API_KEY is not configured');
    }
    if (!this.mailgunDomain) {
      throw new Error('MAILGUN_DOMAIN is not configured');
    }
    if (!from) {
      throw new Error('MAILGUN_FROM is not configured');
    }

    try {
      const result = await this.mailgunClient.messages.create(
        this.mailgunDomain,
        {
          from,
          to: [to],
          subject,
          html,
        },
      );
      this.logger.log(`Email sent successfully to ${to} (id: ${result.id})`);
      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to send email to ${to}: ${message}`);
      throw error;
    }
  }

  async sendWelcomeEmail(
    to: string,
    username: string,
    token: string,
  ): Promise<void> {
    const subject = 'Welcome to Blockwinz! Please verify your email';
    const verificationUrl = `${this.configService.get('APP_URL')}/verify-email?token=${token}`;
    const html = emailVerificationTemplate(username, verificationUrl);
    await this.emailQueueRepository.queueEmail({ to, subject, html });
  }

  async sendPasswordResetEmail(to: string, otp: string): Promise<void> {
    const subject = 'Password Reset Request - Blockwinz';
    const html = passwordResetTemplate(otp);
    await this.emailQueueRepository.queueEmail({ to, subject, html });
  }

  async sendOTP(to: string, otp: string): Promise<void> {
    const subject = 'Admin Login OTP - Blockwinz';
    const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Admin Login OTP</h2>
                <p>Please use the following OTP to log in to your admin account:</p>
                <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0;">
                    <strong>${otp}</strong>
                </div>
                <p>This OTP will expire in 10 minutes.</p>
                <p>If you didn't request this OTP, please contact support immediately.</p>
                <p>Best regards,<br>Blockwinz Team</p>
            </div>
        `;
    await this.emailQueueRepository.queueEmail({ to, subject, html });
  }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const subject = 'Verify your email - Blockwinz';
    const verificationUrl = `${this.configService.get('APP_URL')}/verify-email?token=${token}`;
    const html = resendEmailVerificationTemplate(verificationUrl);
    await this.emailQueueRepository.queueEmail({ to, subject, html });
  }
}
