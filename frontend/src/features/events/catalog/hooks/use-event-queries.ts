import {
  keepPreviousData,
  useQuery,
} from '@tanstack/react-query'

import { publicEventsApi } from '@/features/events/api/events.api'
import {
  toPublicEventFilters,
  type CatalogFilters,
} from '@/features/events/catalog/model/catalog-filters'

const referenceDataStaleTime = 5 * 60 * 1000

export const eventQueryKeys = {
  all: ['events'] as const,
  catalog: (filters: CatalogFilters) =>
    [...eventQueryKeys.all, 'catalog', filters] as const,
  detail: (eventId: number) =>
    [...eventQueryKeys.all, 'detail', eventId] as const,
  categories: () => [...eventQueryKeys.all, 'categories'] as const,
  modalities: () => [...eventQueryKeys.all, 'modalities'] as const,
  communities: () => [...eventQueryKeys.all, 'communities'] as const,
}

export function usePublicEventCatalog(filters: CatalogFilters) {
  return useQuery({
    queryKey: eventQueryKeys.catalog(filters),
    queryFn: () => publicEventsApi.list(toPublicEventFilters(filters)),
    placeholderData: keepPreviousData,
  })
}

export function usePublicEventDetail(eventId: number | null) {
  return useQuery({
    queryKey: eventQueryKeys.detail(eventId ?? 0),
    queryFn: () => publicEventsApi.detail(eventId ?? 0),
    enabled: eventId !== null,
  })
}

export function useEventReferenceData() {
  const categories = useQuery({
    queryKey: eventQueryKeys.categories(),
    queryFn: publicEventsApi.categories,
    staleTime: referenceDataStaleTime,
  })
  const modalities = useQuery({
    queryKey: eventQueryKeys.modalities(),
    queryFn: publicEventsApi.modalities,
    staleTime: referenceDataStaleTime,
  })
  const communities = useQuery({
    queryKey: eventQueryKeys.communities(),
    queryFn: publicEventsApi.communities,
    staleTime: referenceDataStaleTime,
  })

  return {
    categories: categories.data ?? [],
    modalities: modalities.data ?? [],
    communities: communities.data ?? [],
    isPending:
      categories.isPending ||
      modalities.isPending ||
      communities.isPending,
    isError:
      categories.isError ||
      modalities.isError ||
      communities.isError,
  }
}
