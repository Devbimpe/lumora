'use client';
import { useCallback, useEffect, useImperativeHandle, useRef } from 'react';

// Docs: https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/widget-configurations/

export function Turnstile({ onLoad, shouldExecuteOnLoad, config, attrs, ref }) {
  const widgetId = useRef(null);
  const containerRef = useRef(null);

  const cleanup = useCallback(() => {
    if (widgetId.current) {
      window.turnstile?.remove(widgetId.current);
      widgetId.current = null;
    }
  }, []);

  function render() {
    cleanup();
    if (!containerRef.current) return;

    widgetId.current = window.turnstile.render(containerRef.current, {
      // default to always-passing test key
      sitekey:
        process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY || '1x00000000000000000000AA',
      ...config,
    });

    if (shouldExecuteOnLoad) {
      window.turnstile.execute(widgetId.current);
    }

    onLoad?.();
  }

  useEffect(() => {
    const SCRIPT_ID = 'cf-turnstile-script';
    if (window.turnstile) {
      render();
    } else if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src =
        'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad';
      script.defer = true;

      window.onTurnstileLoad = render;
      document.head.appendChild(script);
    }

    return cleanup;
  }, [config]);

  useImperativeHandle(ref, () => ({
    execute: () => {
      if (widgetId.current) window.turnstile?.execute(widgetId.current);
    },
    reset: () => {
      if (widgetId.current) window.turnstile?.reset(widgetId.current);
    },
    remove: () => {
      if (widgetId.current) window.turnstile?.remove(widgetId.current);
    },
  }));

  return <div ref={containerRef} {...attrs} />;
}
