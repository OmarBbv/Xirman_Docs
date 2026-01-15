import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EmailJobData } from './mail.processor';

@Injectable()
export class MailService {
  private readonly logger = new Logger('MailService');

  constructor(
    @InjectQueue('email-queue') private emailQueue: Queue<EmailJobData>,
  ) { }

  async sendOtpEmail(email: string, otp: string): Promise<boolean> {
    try {
      // Email-i queue-ya əlavə edirik
      const job = await this.emailQueue.add(
        'send-otp',
        { email, otp },
        {
          attempts: 3, // 3 dəfə retry edəcək
          backoff: {
            type: 'exponential',
            delay: 2000, // 2 saniyə gözləyəcək, sonra exponential artacaq
          },
          removeOnComplete: true, // Uğurlu olsa queue-dan silinəcək
          removeOnFail: false, // Uğursuz olsa saxlanacaq (monitoring üçün)
        },
      );

      this.logger.log(`📧 Email queued | Job #${job.id} | ${email} | OTP: ${otp}`);

      return true;
    } catch (error) {
      this.logger.error(`❌ Queue error: ${email} - ${error.message}`);
      this.logger.log(`⚠️  FALLBACK OTP: ${otp}`);

      return true;
    }
  }
}
