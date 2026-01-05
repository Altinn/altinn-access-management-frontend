import { ReadableStream, TransformStream, WritableStream } from 'node:stream/web';

const streamPolyfills = {
  ReadableStream,
  TransformStream,
  WritableStream,
};

Object.entries(streamPolyfills).forEach(([key, value]) => {
  if (typeof (globalThis as Record<string, unknown>)[key] === 'undefined') {
    (globalThis as Record<string, unknown>)[key] = value;
  }
});
