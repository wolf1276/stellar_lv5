import { Buffer } from 'buffer';

interface WindowWithBuffer extends Window {
  Buffer?: typeof Buffer;
}

if (typeof window !== 'undefined') {
  const win = window as unknown as WindowWithBuffer;
  win.Buffer = win.Buffer || Buffer;
}
