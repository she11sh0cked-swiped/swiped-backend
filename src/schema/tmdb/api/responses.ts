import { schemaComposer } from '~/utils/graphql'

export const movieResponseTC = schemaComposer.createObjectTC({
  fields: {
    adult: 'Boolean',
    backdrop_path: 'String',
    genre_ids: '[Int]',
    id: 'Int',
    media_type: 'String!',
    original_language: 'String',
    original_title: 'String',
    overview: 'String',
    popularity: 'Int',
    poster_path: 'String',
    release_date: 'String',
    title: 'String',
    video: 'Boolean',
    vote_average: 'Float',
    vote_count: 'Int',
  },
  name: 'movieResponse',
})

export const paginatedResponseTC = schemaComposer.createObjectTC({
  fields: {
    page: 'Int',
    total_pages: 'Int',
    total_results: 'Int',
  },
  name: 'paginatedResponse',
})

export const discoverMovieResponseTC = schemaComposer
  .createObjectTC({
    fields: {
      results: movieResponseTC.getTypePlural(),
    },
    name: 'discoverMovieResponse',
  })
  .merge(paginatedResponseTC)

export const popularMoviesResponseTC = schemaComposer
  .createObjectTC({
    fields: {},
    name: 'popularMoviesResponse',
  })
  .merge(discoverMovieResponseTC)
