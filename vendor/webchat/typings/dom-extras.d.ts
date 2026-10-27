// Browser APIs the widget uses that TypeScript 3.9's lib.dom (the version IO's
// react builder ships) doesn't declare yet. Types only: every browser the store
// supports has them at runtime.

interface ResizeObserver {
  observe(target: Element): void;
  unobserve(target: Element): void;
  disconnect(): void;
}

declare var ResizeObserver: {
  prototype: ResizeObserver;
  new (callback: (entries: unknown[], observer: ResizeObserver) => void): ResizeObserver;
};

interface BlobEvent extends Event {
  readonly data: Blob;
}

interface MediaRecorder extends EventTarget {
  readonly mimeType: string;
  readonly stream: MediaStream;
  readonly state: 'inactive' | 'recording' | 'paused';
  ondataavailable: ((event: BlobEvent) => void) | null;
  onstop: ((event: Event) => void) | null;
  start(timeslice?: number): void;
  stop(): void;
}

declare var MediaRecorder: {
  prototype: MediaRecorder;
  new (stream: MediaStream, options?: { mimeType?: string }): MediaRecorder;
  isTypeSupported(type: string): boolean;
};

interface Window {
  MediaRecorder: typeof MediaRecorder;
}
