import { Controller, Get } from '@nestjs/common';
import { NotificationQueueService } from './notifications/notification-queue.service';

interface HealthResponse {
  status: 'ok'|'degraded';
  timestamp: string;
  queue: ReturnType<NotificationQueueService['status']>;
}

@Controller('health')
export class HealthController {
  constructor(private readonly queue:NotificationQueueService) {}
  @Get()
  getHealth(): HealthResponse {
    return {
      status: this.queue.status().redis?'ok':'degraded',
      timestamp: new Date().toISOString(),
      queue:this.queue.status(),
    };
  }
}
