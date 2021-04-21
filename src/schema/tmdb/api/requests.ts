import { schemaComposer } from '~/utils/graphql'

export const requestTC = schemaComposer.createInputTC({
  fields: {
    id: 'Int',
    language: 'String',
  },
  name: 'request',
})

export const movieNowPlayingRequestTC = schemaComposer
  .createInputTC({
    fields: {
      page: 'Int',
      region: 'String',
    },
    name: 'movieNowPlayingRequest',
  })
  .merge(requestTC)

export const popularMoviesRequestTC = schemaComposer
  .createInputTC({
    fields: {},
    name: 'popularMoviesRequest',
  })
  .merge(movieNowPlayingRequestTC)
