/// <reference types="vite/client" />

import 'react';

declare global {
  interface ImportMetaEnv {
    readonly VITE_TURNSTILE_SITE_KEY: string;
  }
}

declare module 'react' {
  interface CSSProperties {
    [property: `--${string}`]: string | number;
  }
}
