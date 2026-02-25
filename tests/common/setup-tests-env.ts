process.env.ENV = 'tests';

// Polyfill TextEncoder/TextDecoder for environments where they are missing (e.g., Jest + jsdom)
import { TextDecoder, TextEncoder } from 'util';

const globalAny = global as unknown as {
  TextEncoder: typeof TextEncoder;
  TextDecoder: typeof TextDecoder;
};

if (typeof globalAny.TextEncoder === 'undefined') {
  globalAny.TextEncoder = TextEncoder;
}

if (typeof globalAny.TextDecoder === 'undefined') {
  globalAny.TextDecoder = TextDecoder;
}
