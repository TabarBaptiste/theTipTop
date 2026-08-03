import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: "Vérifier l'état de santé du service API" })
  @ApiResponse({ status: 200, description: 'Le service est opérationnel' })
  check() {
    return { status: 'ok' };
  }
}
