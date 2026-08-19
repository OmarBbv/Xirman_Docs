import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const SENSITIVE_FIELDS = ['password', 'otpCode'];

/**
 * Cavablardan parol hash-ini və OTP kodunu təmizləyir.
 * User entity bir çox əlaqədə (uploadedBy, viewedBy, createdBy ...) eager
 * yüklənir, ona görə təmizləmə rekursiv aparılır.
 */
@Injectable()
export class StripPasswordInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => this.strip(data, new WeakSet())));
  }

  private strip(value: any, seen: WeakSet<object>): any {
    if (value === null || typeof value !== 'object') {
      return value;
    }

    // Buffer/Date kimi obyektlərə və dövrü istinadlara toxunmuruq.
    if (value instanceof Date || Buffer.isBuffer(value)) {
      return value;
    }
    if (seen.has(value)) {
      return value;
    }
    seen.add(value);

    if (Array.isArray(value)) {
      value.forEach((item) => this.strip(item, seen));
      return value;
    }

    for (const field of SENSITIVE_FIELDS) {
      if (field in value) {
        delete value[field];
      }
    }

    for (const key of Object.keys(value)) {
      this.strip(value[key], seen);
    }

    return value;
  }
}
