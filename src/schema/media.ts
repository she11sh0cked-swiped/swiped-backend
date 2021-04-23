import { MovieDb } from 'moviedb-promise'

import config from '~/config'
import {
  Media,
  Media_Type,
  MediaKeyInput,
  QueryMedia_FindByIdsArgs,
} from '~/types/api.generated'
import cache, { cachedCall } from '~/utils/cache'
import { schemaComposer } from '~/utils/graphql'
import Schema from '~/utils/schema'

const tmdb = new MovieDb(config.tmdbApiKey)

export const mediaKeyTC = schemaComposer.createObjectTC({
  fields: {
    id: 'Int!',
    media_type: schemaComposer
      .createEnumTC({
        name: 'media_type',
        values: { movie: { value: 'movie' }, tv: { value: 'tv' } },
      })
      .getTypeNonNull(),
  },
  name: 'mediaKey',
})

const media = new Schema(
  schemaComposer
    .createInterfaceTC<Media>({
      fields: {
        backdrop_path: 'String',
        genre_ids: '[Int]',
        original_language: 'String',
        overview: 'String',
        popularity: 'Float',
        poster_path: 'String',
        vote_average: 'Float',
        vote_count: 'Int',
      },
      name: 'media',
    })
    .merge(mediaKeyTC)
)

const movieTC = schemaComposer
  .createObjectTC({
    fields: {
      adult: 'Boolean',
      original_title: 'String',
      release_date: 'String',
      title: 'String',
      video: 'Boolean',
    },
    name: 'movie',
  })
  .merge(media.tc)

const tvTC = schemaComposer
  .createObjectTC({
    fields: {
      first_air_date: 'String',
      name: 'String',
      origin_country: 'String',
      original_name: 'String',
    },
    name: 'tv',
  })
  .merge(media.tc)

media.tc.addTypeResolver<Media>(
  movieTC,
  (value) => value.media_type === Media_Type.Movie
)

media.tc.addTypeResolver<Media>(
  tvTC,
  (value) => value.media_type === Media_Type.Tv
)

function mediaKeyToCacheKey(mediaKey: MediaKeyInput) {
  return JSON.stringify(mediaKey)
}

function cacheMedia(media: Media[]) {
  cache.mset(
    media.map((val) => ({
      key: mediaKeyToCacheKey({
        id: val.id,
        media_type: val.media_type,
      }),
      val,
    }))
  )
}

export async function findMediaById(mediaKey: MediaKeyInput): Promise<Media> {
  const cacheKey = mediaKeyToCacheKey(mediaKey)

  let response = cache.get<Media>(cacheKey)

  if (response == null) {
    let result
    switch (mediaKey.media_type) {
      case Media_Type.Movie:
        result = await tmdb.movieInfo({ id: mediaKey.id })
        break
      case Media_Type.Tv:
        result = await tmdb.tvInfo({ id: mediaKey.id })
        break
    }
    response = { ...result, ...mediaKey }
    cache.set(cacheKey, response)
  }

  return response
}

media.addFields('queries', {
  findById: schemaComposer.createResolver<undefined>({
    args: {
      media: mediaKeyTC.getInputTypeComposer().getTypeNonNull(),
    },
    kind: 'query',
    name: 'media_findById',
    resolve({ args: { media } }): Promise<Media> {
      return findMediaById(media)
    },
    type: media.tc,
  }),
  findByIds: schemaComposer.createResolver<undefined, QueryMedia_FindByIdsArgs>(
    {
      args: {
        media: mediaKeyTC
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

      const discoverTv =
        (await cachedCall(tmdb.discoverTv.bind(tmdb))).results ?? []

      const tvs = [...discoverTv].map((tv) => ({
        ...tv,
        id: tv.id ?? -1,
        media_type: Media_Type.Tv,
      }))

      const recommendations = [...movies, ...tvs]

      cacheMedia(recommendations)

      return recommendations
    },
    type: media.tc.getTypePlural(),
  }),
})

export default media
