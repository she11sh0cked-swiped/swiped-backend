import { MovieDb } from 'moviedb-promise'

import config from '~/config'
import {
  Media,
  Media_Type,
  MediaInput,
  QueryMedia_FindByIdsArgs,
} from '~/types/api.generated'
import cache, { cachedCall } from '~/utils/cache'
import { schemaComposer } from '~/utils/graphql'
import Schema from '~/utils/schema'

const tmdb = new MovieDb(config.tmdbApiKey)

const media = new Schema(
  schemaComposer.createInterfaceTC<Media>({
    fields: {
      id: 'Int!',
      media_type: schemaComposer
        .createEnumTC({
          name: 'media_type',
          values: { movie: { value: 'movie' } },
        })
        .getTypeNonNull(),
    },
    name: 'media',
  })
)

const movieTC = schemaComposer
  .createObjectTC({
    fields: {
      adult: 'Boolean',
      backdrop_path: 'String',
      genre_ids: '[Int]',
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
  .merge(media.tc)

media.tc.addTypeResolver<Media>(
  movieTC,
  (value) => value.media_type === Media_Type.Movie
)

function mediaInputToCacheKey(mediaInput: MediaInput) {
  return JSON.stringify(mediaInput)
}

function cacheMedia(media: MediaInput[]) {
  cache.mset(
    media.map((val) => ({
      key: mediaInputToCacheKey({
        id: val.id,
        media_type: val.media_type,
      }),
      val,
    }))
  )
}

export async function findMediaById(mediaInput: MediaInput): Promise<Media> {
  const cacheKey = mediaInputToCacheKey(mediaInput)

  let response = cache.get<Media>(cacheKey)

  if (response == null) {
    let result
    switch (mediaInput.media_type) {
      case Media_Type.Movie:
        result = await tmdb.movieInfo({ id: mediaInput.id })
        break
    }
    response = { ...result, ...mediaInput }
    cache.set(cacheKey, response)
  }

  return response
}

media.addFields('queries', {
  findByIds: schemaComposer.createResolver<undefined, QueryMedia_FindByIdsArgs>(
    {
      args: {
        media: media.tc
          .getInputTypeComposer()
          .getTypeNonNull()
          .getTypePlural()
          .getTypeNonNull(),
      },
      kind: 'query',
      name: 'media_findByIds',
      resolve({ args: { media } }): Promise<Media[]> {
        return Promise.all(media.map(findMediaById))
      },
      type: media.tc.getTypePlural(),
    }
  ),
  recommendations: schemaComposer.createResolver({
    kind: 'query',
    name: 'media_recommendations',
    async resolve() {
      const discoverMovie =
        (await cachedCall(tmdb.discoverMovie.bind(tmdb))).results ?? []

      const movies = [...discoverMovie].map((movie) => ({
        ...movie,
        id: movie.id ?? -1,
        media_type: Media_Type.Movie,
      }))

      const recommendations = [...movies]

      cacheMedia(recommendations)

      return recommendations
    },
    type: media.tc.getTypePlural(),
  }),
})

export default media
