import type { MediaElementEventMap } from "@lqv/playback";

export class EventEmitter {
  private __listeners: Partial<
    Record<keyof MediaElementEventMap, (() => unknown)[]>
  >;

  constructor() {
    this.__listeners = {};
  }

  addEventListener<K extends keyof MediaElementEventMap>(
    type: K,
    listener: () => unknown,
  ): void {
    if (!this.__listeners.hasOwnProperty(type)) {
      this.__listeners[type] = [];
    }
    this.__listeners[type].push(listener);
  }

  removeEventListener<K extends keyof MediaElementEventMap>(
    type: K,
    listener: () => unknown,
  ): void {
    if (!this.__listeners[type]) {
      return;
    }
    const index = this.__listeners[type].indexOf(listener);
    if (index !== -1) {
      this.__listeners[type].splice(index, 1);
    }
  }

  protected emit<K extends keyof MediaElementEventMap>(type: K): void {
    if (!this.__listeners[type]) {
      return;
    }
    for (const listener of this.__listeners[type]) {
      listener();
    }
  }
}
