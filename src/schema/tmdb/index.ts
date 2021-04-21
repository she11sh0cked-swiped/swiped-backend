import { MovieDb } from 'moviedb-promise'

import config from '~/config'
import { QueryTmdb_MoviePopularArgs } from '~/types/api.generated'
import cache from '~/utils/cache'
import { schemaComposer } from '~/utils/graphql'
import Schema from '~/utils/schema'

import { popularMoviesRequestTC } from './api/requests'
import { popularMoviesResponseTC } from './api/responses'

type UnPromisify<T> = T extends Promise<infer U> ? U : T

type KeysMatching<T extends unknown, V> = {
  [K in keyof T]-?: T[K] extends V ? K : never
}[keyof T]

// eslint-disable-next-line @typescript-eslint/ban-types
type TQueries = KeysMatching<MovieDb, Function>
type TQueryParameters<TOperation extends TQueries> = Parameters<
  MovieDb[TOperation]
>
type TQueryResponse<TQuery extends TQueries> = UnPromisify<
  ReturnType<MovieDb[TQuery]>
>

const tmdbApi = new MovieDb(config.tmdbApiKey)

async function cachedApiCall<TQuery extends TQueries>(
  query: TQuery,
  ...args: TQueryParameters<TQuery>
): Promise<TQueryResponse<TQuery>> {
  type TArgs = TQueryParameters<TQuery>
  type TResponse = TQueryResponse<TQuery>
  type TApiCall = (...args: TArgs) => Promise<TResponse>

  const cacheKey = JSON.stringify({ args, query })

  let response = cache.get(cacheKey)

  if (response == null) {
    const apiResponse = await (tmdbApi[query] as TApiCall)(...args)
    response = apiResponse
    cache.set(cacheKey, response)
  }

  return response as Promise<TResponse>
}

const tmdb = new Schema('tmdb')

tmdb.addFields('queries', {
  moviePopular: schemaComposer.createResolver<
    undefined,
    QueryTmdb_MoviePopularArgs
  >({
    args: popularMoviesRequestTC.getFields(),
    kind: 'query',
    name: 'tmdb_moviePopular',
    async resolve({ args }) {
      return await cachedApiCall('moviePopular', args)
    },
    type: popularMoviesResponseTC,
  }),
})

export default tmdb
