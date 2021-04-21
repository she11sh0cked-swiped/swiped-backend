import { MovieDb } from 'moviedb-promise'

import config from '~/config'
import { Media } from '~/types/api.generated'
import { cachedCall } from '~/utils/cache'
import { schemaComposer } from '~/utils/graphql'
import Schema from '~/utils/schema'

const tmdb = new MovieDb(config.tmdbApiKey)

const movieTC = schemaComposer.createObjectTC({
  fields: {
    adult: 'Boolean',
    backdrop_path: 'String',
    genre_ids: '[Int]',
    id: 'Int',
    original_language: 'String',
    original_title: 'String',
    overview: 'String',
    popularity: 'Float',
    poster_path: 'String',
    release_date: 'String',
    title: 'String',
    video: 'Boolean',
    vote_average: 'Float',
    vote_count: 'Int',
  },
  name: 'movie',
})

const media = new Schema(
  schemaComposer.createUnionTC({
    name: 'media',
    resolveType(data: Media) {
      switch (data.__typename) {
        case 'movie':
          return movieTC.getType()
      }
    },
    types: [movieTC],
  })
)

media.addFields('queries', {
  recommendations: schemaComposer.createResolver({
    kind: 'query',
    name: 'media_recommendations',
    async resolve() {
      const discoverMovie =
        (await cachedCall(tmdb.discoverMovie.bind(tmdb))).results ?? []

      const movies = [...discoverMovie].map((movie) => ({
        ...movie,
        __typename: 'movie',
      }))

      const recommendations = [...movies]

      return recommendations
    },
    type: media.tc.getTypePlural(),
  }),
})

export default media
