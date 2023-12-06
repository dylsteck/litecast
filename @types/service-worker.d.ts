interface ExtendableEvent extends Event {
  waitUntil(fn: Promise<any>): void;
}

interface PushSubscriptionChangeEvent extends ExtendableEvent {
  readonly newSubscription?: PushSubscription;
  readonly oldSubscription?: PushSubscription;
}

// Client API

declare class Client {
  frameType: ClientFrameType;
  id: string;
  url: string;
  focused: boolean;

  focus(): void;

  postMessage(message: any): void;
}

interface Clients {
  claim(): Promise<any>;

  get(id: string): Promise<Client>;

  matchAll(options?: ClientMatchOptions): Promise<Client[]>;

  openWindow(url: string): Promise<void>;
}

interface ClientMatchOptions {
  includeUncontrolled?: boolean;
  type?: ClientMatchTypes;
}

interface WindowClient {
  focused: boolean;
  visibilityState: WindowClientState;

  focus(): Promise<WindowClient>;

  navigate(url: string): Promise<WindowClient>;
}

type ClientFrameType = 'auxiliary' | 'top-level' | 'nested' | 'none';
type ClientMatchTypes = 'window' | 'worker' | 'sharedworker' | 'all';
type WindowClientState = 'hidden' | 'visible' | 'prerender' | 'unloaded';

// Fetch API

interface FetchEvent extends ExtendableEvent {
  clientId: string | null;
  request: Request;

  respondWith(response: Promise<Response> | Response): Promise<Response>;
}

interface InstallEvent extends ExtendableEvent {
  activeWorker: ServiceWorker;
}

interface ActivateEvent extends ExtendableEvent {}

// Notification API

interface NotificationEvent extends ExtendableEvent {
  action: string;
  notification: Notification;
}

// Push API

interface PushEvent extends ExtendableEvent {
  data: PushMessageData;
}

interface PushMessageData {
  arrayBuffer(): ArrayBuffer;

  blob(): Blob;

  json(): any;

  text(): string;
}

// Sync API

interface SyncEvent extends ExtendableEvent {
  lastChance: boolean;
  tag: string;
}

interface ExtendableMessageEvent extends ExtendableEvent {
  data: any;
  source: Client | object;
}

// ServiceWorkerGlobalScope

interface ServiceWorkerGlobalScope {
  __WB_DISABLE_DEV_LOGS: boolean;

  caches: CacheStorage;
  clients: Clients;
  registration: ServiceWorkerRegistration;

  addEventListener(
    event: 'activate',
    fn: (event?: ExtendableEvent) => any,
  ): void;

  addEventListener(
    event: 'message',
    fn: (event?: ExtendableMessageEvent) => any,
  ): void;

  addEventListener(event: 'fetch', fn: (event?: FetchEvent) => any): void;

  addEventListener(
    event: 'install',
    fn: (event?: ExtendableEvent) => any,
  ): void;

  addEventListener(event: 'push', fn: (event?: PushEvent) => any): void;

  addEventListener(
    event: 'notificationclick',
    fn: (event?: NotificationEvent) => any,
  ): void;

  addEventListener(event: 'sync', fn: (event?: SyncEvent) => any): void;

  fetch(request: Request | string): Promise<Response>;

  skipWaiting(): Promise<void>;
}
