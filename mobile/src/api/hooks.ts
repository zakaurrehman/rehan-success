import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query'
import { apiFetch } from './client'

/** GET a path and cache it under [path]. */
export function useApi<T>(
  path: string | null,
  options?: Partial<UseQueryOptions<T>>
) {
  return useQuery<T>({
    queryKey: [path],
    queryFn: () => apiFetch<T>(path as string),
    enabled: path != null,
    ...options,
  })
}

type MutationMethod = 'POST' | 'PATCH' | 'PUT' | 'DELETE'

/**
 * Mutate `path` and invalidate the given query keys on success so lists
 * refresh automatically.
 */
export function useApiMutation<TBody = unknown, TResp = unknown>(
  path: string,
  method: MutationMethod = 'POST',
  invalidate: string[] = []
) {
  const qc = useQueryClient()
  return useMutation<TResp, Error, TBody>({
    mutationFn: (body: TBody) => apiFetch<TResp>(path, { method, body }),
    onSuccess: () => {
      invalidate.forEach((key) => qc.invalidateQueries({ queryKey: [key] }))
    },
  })
}
