import { MovieDb } from 'moviedb-promise'

import config from '~/config'
import { QueryTmdb_MoviePopularArgs } from '~/types/api.generated'
import { cachedCall } from '~/utils/cache'
import { schemaComposer } from '~/utils/graphql'
import Schema from '~/utils/schema'

import { popularMoviesRequestTC } from './api/requests'
import { popularMoviesResponseTC } from './api/responses'

const api = new MovieDb(config.tmdbApiKey)

const tmdb = new Schema('tmdb')

tmdb.addFields('queries', {
  moviePopular: schemaComposer.createResolver<
    undefined,
    QueryTmdb_MoviePopularArgs
  >({
    args: popularMoviesRequestTC.getFields(),
    kind: 'query',
    name: 'tmdb_moviePopular',
    resolve: ({ args }) => cachedCall(api.moviePopular.bind(api), args),
    type: popularMoviesResponseTC,
  }),
})

export default tmdb
