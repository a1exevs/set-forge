import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const SKIP_ENVELOPE_KEY = 'skipEnvelope';

/** The route answers its own body, outside the envelope (the health check probes read it as is). */
export const SkipEnvelope = (): CustomDecorator<string> => SetMetadata(SKIP_ENVELOPE_KEY, true);
