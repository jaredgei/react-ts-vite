import { useEffect, useRef, useState } from 'react';

import { useError } from '@/context/Error';

type TurnstileApi = {
  render: (container: HTMLElement, options: Record<string, string | (() => void)>) => string;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let loading: Promise<TurnstileApi> | undefined;

const loadTurnstile = () =>
  (loading ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error('Turnstile did not initialize')));
    script.onerror = () => {
      loading = undefined;
      script.remove();
      reject(new Error('Could not load the verification challenge. Check your connection or disable content blockers, then try again.'));
    };
    document.head.append(script);
  }));

const Turnstile = ({ name }: { name: string }) => {
  const container = useRef<HTMLDivElement>(null);
  const [interactive, setInteractive] = useState(false);
  const { showError } = useError();

  useEffect(() => {
    let turnstile: TurnstileApi | undefined;
    let widgetId: string | undefined;
    let mounted = true;
    const render = async () => {
      try {
        turnstile = await loadTurnstile();
      } catch (error) {
        if (mounted) showError(error instanceof Error ? error.message : error);
        return;
      }
      if (!mounted || !container.current) return;
      widgetId = turnstile.render(container.current, {
        sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
        theme: 'auto',
        size: 'flexible',
        appearance: 'interaction-only',
        'response-field-name': name,
        'before-interactive-callback': () => setInteractive(true),
      });
    };
    void render();
    return () => {
      mounted = false;
      if (widgetId) turnstile?.remove(widgetId);
    };
  }, [name, showError]);

  return <div ref={container} hidden={!interactive} />;
};

export default Turnstile;
