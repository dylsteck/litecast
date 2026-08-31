import type { CastViewEvent } from './types';

export class ViewEventBuffer {
  private events: CastViewEvent[] = [];
  private seen = new Map<string, number>();

  track(event: Omit<CastViewEvent, 'ts'> & { ts?: number }) {
    const ts = event.ts ?? Date.now();
    const previous = this.seen.get(event.hash);
    if (previous && ts >= previous) return;

    this.events = this.events.filter((item) => item.hash !== event.hash);
    this.seen.set(event.hash, ts);
    this.events.push({ ...event, ts });
  }

  drain(): CastViewEvent[] {
    const next = this.events;
    this.events = [];
    this.seen.clear();
    return next;
  }

  restore(events: CastViewEvent[]) {
    for (const event of events) this.track(event);
  }
}
