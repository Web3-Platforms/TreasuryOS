import * as Sentry from '@sentry/nestjs';
import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import type { AuthenticatedUser } from '@treasuryos/types';

import { loadApiGatewayEnv } from '../../config/env.js';

@Injectable()
export class ObservabilityService {
  private readonly logger = new Logger('Observability');

  async sendBackendSmokeTest(input: {
    actor: AuthenticatedUser;
    requestId?: string;
  }) {
    const env = loadApiGatewayEnv();

    if (!env.SENTRY_DSN) {
      throw new ServiceUnavailableException(
        'Sentry is not configured for the API gateway runtime.',
      );
    }

    const eventId =
      Sentry.withScope((scope) => {
        scope.setTag('surface', 'api');
        scope.setTag('smoke_test', 'true');
        scope.setUser({
          id: input.actor.id,
          email: input.actor.email,
        });

        if (input.requestId) {
          scope.setTag('request_id', input.requestId);
        }

        scope.setContext('treasuryos_smoke_test', {
          source: 'api_observability_endpoint',
          actorId: input.actor.id,
          actorEmail: input.actor.email,
        });

        const error = new Error(
          `TreasuryOS API Sentry smoke test (${new Date().toISOString()})`,
        );
        error.name = 'TreasuryOsApiSentrySmokeTest';

        return Sentry.captureException(error);
      }) ?? null;

    const flushed = await Sentry.flush(2000);

    if (!flushed) {
      throw new ServiceUnavailableException({
        message:
          'Sentry accepted the API smoke-test event locally but did not flush it in time.',
        eventId,
        requestId: input.requestId ?? null,
      });
    }

    this.logger.log(
      JSON.stringify({
        message: 'observability.smoke_test.sent',
        surface: 'api',
        eventId,
        requestId: input.requestId ?? null,
        actorId: input.actor.id,
        actorEmail: input.actor.email,
      }),
    );

    return {
      status: 'ok',
      surface: 'api',
      eventId,
      requestId: input.requestId ?? null,
      message: 'Backend Sentry test event submitted.',
    };
  }
}
