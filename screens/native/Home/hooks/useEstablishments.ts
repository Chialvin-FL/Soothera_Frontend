/**
 * useEstablishments.ts
 *
 * Fetches all salon establishments from the backend and maps
 * them to the TopRatedSalon shape used by the Home UI.
 *
 * SalonEstablishment (API) → TopRatedSalon (UI)
 *   id            → id
 *   name          → name
 *   address       → location
 *   salonPicture  → image (remote URI)
 *   (no rating)   → rating  (defaults to 0 — shown as unrated)
 *   (no services) → services (empty — populated by SalonService API separately)
 */

import { useState, useEffect, useCallback } from 'react';
import { viewSalons } from '@/api/endpoints/apiSalonEstablishment';
import type { SalonEstablishment } from '@/api/types';
import type { TopRatedSalon } from '../types/Home';

function toTopRatedSalon(est: SalonEstablishment): TopRatedSalon {
  return {
    id: est.id,
    name: est.name,
    rating: 0,               // backend doesn't store rating yet
    location: est.address,
    image: est.salonPicture ? { uri: est.salonPicture } : require('../../../../assets/spas/grand.png'),
    services: [],            // populated separately by SalonService if needed
    description: est.description ?? undefined,
    contactNumber: est.contactNumber ?? undefined,
    businessHours: est.businessHours ?? undefined,
    socials: est.socials ?? undefined,
  };
}

export interface UseEstablishmentsResult {
  salons: TopRatedSalon[];
  rawEstablishments: SalonEstablishment[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useEstablishments(): UseEstablishmentsResult {
  const [salons, setSalons] = useState<TopRatedSalon[]>([]);
  const [rawEstablishments, setRawEstablishments] = useState<SalonEstablishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await viewSalons();
      if (res.success && res.data) {
        const data = res.data as SalonEstablishment | SalonEstablishment[] | { items: SalonEstablishment[] };
        const list: SalonEstablishment[] = Array.isArray(data)
          ? data
          : data && 'items' in data
          ? data.items
          : [data as SalonEstablishment];
        setRawEstablishments(list);
        setSalons(list.map(toTopRatedSalon));
      } else {
        setError(res.message ?? 'Failed to load establishments.');
      }
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load establishments.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { salons, rawEstablishments, loading, error, refetch: fetch };
}
