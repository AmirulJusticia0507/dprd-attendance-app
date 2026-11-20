'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch, readError } from './api';

export function useCollection(path) {
  const [state, setState] = useState({ data: [], meta: null, loading: true, error: '' });

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: '' }));
    try {
      const response = await apiFetch(path);
      const body = await response.json();
      if (!response.ok) throw new Error(await readError(response, 'Gagal memuat data'));
      setState({ data: body.data || [], meta: body.meta || null, loading: false, error: '' });
    } catch (error) {
      setState({ data: [], meta: null, loading: false, error: error.message });
    }
  }, [path]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load };
}
