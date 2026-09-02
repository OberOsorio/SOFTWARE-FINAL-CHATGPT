import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

export type PlatformRealtimeChange = {
  table: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  occurredAt: number;
};

const LOCAL_CHANGE_EVENTS = [
  'campaign-form-schema-changed',
  'campaign-jurisdiction-changed',
  'global-admin-users-changed',
  'permissions-updated',
];

/**
 * Mantiene sincronizada la vista activa con cualquier cambio publicado por
 * Supabase y con las mutaciones que ya emite la aplicación en esta pestaña.
 */
export function usePlatformRealtime(
  enabled: boolean,
  onChange: (change: PlatformRealtimeChange) => void,
) {
  const callbackRef = useRef(onChange);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    callbackRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!enabled) return;

    const publish = (change: PlatformRealtimeChange) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        callbackRef.current(change);
        window.dispatchEvent(new CustomEvent('platform-data-changed', { detail: change }));
      }, 180);
    };

    const channel = supabase
      .channel(`platform-live-${crypto.randomUUID()}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        (payload) => publish({
          table: payload.table,
          eventType: payload.eventType,
          occurredAt: Date.now(),
        }),
      )
      .subscribe();

    const handleLocalChange = (event: Event) => publish({
      table: event.type,
      eventType: '*',
      occurredAt: Date.now(),
    });
    LOCAL_CHANGE_EVENTS.forEach(eventName => window.addEventListener(eventName, handleLocalChange));

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      LOCAL_CHANGE_EVENTS.forEach(eventName => window.removeEventListener(eventName, handleLocalChange));
      void supabase.removeChannel(channel);
    };
  }, [enabled]);
}
