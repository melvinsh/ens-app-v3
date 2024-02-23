import { QueryFunctionContext, queryOptions, useQuery } from '@tanstack/react-query'

import {
  DnsDnssecVerificationFailedError,
  DnsInvalidAddressChecksumError,
  DnsInvalidTxtRecordError,
  DnsNoTxtRecordError,
  DnsResponseStatusError,
  UnsupportedNameTypeError,
} from '@ensdomains/ensjs'
import { getDnsOwner, GetDnsOwnerParameters, GetDnsOwnerReturnType } from '@ensdomains/ensjs/dns'

import { useQueryOptions } from '@app/hooks/useQueryOptions'
import { CreateQueryKey, PartialBy, QueryConfig } from '@app/types'

type UseDnsOwnerParameters = PartialBy<GetDnsOwnerParameters, 'name'>

type UseDnsOwnerReturnType = GetDnsOwnerReturnType

export type UseDnsOwnerError =
  | UnsupportedNameTypeError
  | DnsResponseStatusError
  | DnsDnssecVerificationFailedError
  | DnsNoTxtRecordError
  | DnsInvalidTxtRecordError
  | DnsInvalidAddressChecksumError
  | Error

type UseDnsOwnerConfig = QueryConfig<UseDnsOwnerReturnType, UseDnsOwnerError>

export type GetDnsOwnerQueryKey<TParams extends UseDnsOwnerParameters> = CreateQueryKey<
  TParams,
  'getDnsOwner',
  'independent'
>

export const getDnsOwnerQueryFn = async <TParams extends UseDnsOwnerParameters>({
  queryKey: [{ name, ...params }],
}: QueryFunctionContext<GetDnsOwnerQueryKey<TParams>>) => {
  if (!name) throw new Error('name is required')

  return getDnsOwner({ name, ...params })
}

export const useDnsOwner = <TParams extends UseDnsOwnerParameters>({
  // config
  gcTime = 1_000 * 60 * 60 * 24,
  enabled = true,
  staleTime,
  scopeKey,
  // params
  ...params
}: TParams & UseDnsOwnerConfig) => {
  const initialOptions = useQueryOptions({
    params,
    scopeKey,
    functionName: 'getDnsOwner',
    queryDependencyType: 'independent',
    queryFn: getDnsOwnerQueryFn,
  })

  const preparedOptions = queryOptions({
    queryKey: initialOptions.queryKey,
    queryFn: initialOptions.queryFn,
  })

  const query = useQuery({
    ...preparedOptions,
    enabled:
      enabled &&
      !!params.name &&
      !params.name?.endsWith('.eth') &&
      params.name !== 'eth' &&
      params.name !== '[root]',
    gcTime,
    retry: 2,
    staleTime,
  })

  return {
    ...query,
    isCachedData: query.status === 'success' && query.isFetched && !query.isFetchedAfterMount,
  }
}
