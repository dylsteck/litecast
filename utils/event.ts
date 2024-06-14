// utils/eventEmitter.ts
type Handler = (...args: any[]) => void;

class EventEmitter {
  private events: { [key: string]: Handler[] };

  constructor() {
    this.events = {};
  }

  on(event: string, handler: Handler) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(handler);
  }

  off(event: string, handler: Handler) {
    if (!this.events[event]) return;

    this.events[event] = this.events[event].filter(h => h !== handler);
  }

  emit(event: string, ...args: any[]) {
    if (!this.events[event]) return;

    this.events[event].forEach(handler => handler(...args));
  }
}

export const eventEmitter = new EventEmitter();