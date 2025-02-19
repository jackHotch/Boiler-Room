import 'express-session';

declare module 'express-session' {
  interface SessionData {
    steamId?: string; // Add steamId as an optional session property
    steamName?: string,
    steamPFP?: string
  }
}
