import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import * as brevo from '@getbrevo/brevo';

export interface EmailJobData {
  type: 'otp' | 'document';
  email: string;
  otp: string;
}

@Processor('email-queue', {
  concurrency: 5,
})
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);
  private apiInstance: brevo.TransactionalEmailsApi;

  constructor(private configService: ConfigService) {
    super();

    const apiKey = this.configService.get<string>('BREVO_API_KEY');

    if (!apiKey) {
      throw new Error('BREVO_API_KEY environment variable is not set');
    }

    this.apiInstance = new brevo.TransactionalEmailsApi();
    this.apiInstance.setApiKey(
      brevo.TransactionalEmailsApiApiKeys.apiKey,
      apiKey,
    );
  }

  async process(job: Job<EmailJobData>): Promise<any> {
    const { email, otp } = job.data;

    this.logger.log(`📧 Processing email job #${job.id} for ${email}`);

    try {
      const sendSmtpEmail = new brevo.SendSmtpEmail();

      sendSmtpEmail.subject = 'Xirman Docs - Təsdiq Kodu (OTP)';
      sendSmtpEmail.to = [{ email }];
      sendSmtpEmail.htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: white;
              border-radius: 10px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 30px;
              text-align: center;
              color: white;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content {
              padding: 40px 30px;
              text-align: center;
            }
            .otp-code {
              font-size: 36px;
              font-weight: bold;
              color: #667eea;
              background-color: #f0f0ff;
              padding: 20px;
              border-radius: 8px;
              margin: 30px 0;
              letter-spacing: 8px;
            }
            .message {
              color: #666;
              line-height: 1.6;
              font-size: 16px;
            }
            .footer {
              background-color: #f8f8f8;
              padding: 20px;
              text-align: center;
              color: #999;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Xirman Docs</h1>
            </div>
            <div class="content">
              <p class="message">Salam!</p>
              <p class="message">Hesabınızı təsdiqləmək üçün aşağıdakı kodu daxil edin:</p>
              <div class="otp-code">${otp}</div>
              <p class="message">Bu kod 10 dəqiqə ərzində etibarlıdır.</p>
              <p class="message" style="color: #ff6b6b; font-weight: bold;">
                ⚠️ Bu kodu heç kimlə paylaşmayın!
              </p>
            </div>
            <div class="footer">
              <p>Bu email avtomatik olaraq göndərilib.</p>
              <p>Xirman Docs © 2026</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const senderEmail = this.configService.get<string>('BREVO_SENDER_EMAIL') || 'noreply@xirmandocs.com';

      sendSmtpEmail.sender = {
        name: 'Xirman Docs',
        email: senderEmail,
      };

      const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);

      this.logger.log(`✅ Email sent | Job #${job.id} | Recipient: ${email} | OTP: ${otp}`);

      return { success: true, messageId: result.body.messageId };
    } catch (error) {
      this.logger.error(`❌ Email failed | Job #${job.id} | ${email} - ${error.message}`);

      // BullMQ avtomatik retry edəcək
      throw error;
    }
  }
}
