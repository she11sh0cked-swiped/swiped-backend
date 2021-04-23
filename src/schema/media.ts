import { MovieDb } from 'moviedb-promise'
import {
  MovieResponse,
  MovieResult,
  ShowResponse,
  TvResult,
} from 'moviedb-promise/dist/request-types'

import config from '~/config'
import {
  Media,
  Media_Type,
  MediaKeyInput,
  QueryMedia_FindByIdsArgs,
  QueryMedia_RecommendationsArgs,
  User,
  Vote,
} from '~/types/api.generated'
import { TDocument } from '~/types/db'
import cache, { cachedCall } from '~/utils/cache'
import { schemaComposer } from '~/utils/graphql'
import Schema from '~/utils/schema'

import user from './user'

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

function mediaKeyToCacheKey({ id, media_type }: MediaKeyInput) {
  return JSON.stringify({ id, media_type })
}

function cacheMedia(media: Media[]) {
  cache.mset(
    media.map((val) => ({
      key: mediaKeyToCacheKey(val),
      val,
    }))
  )
}

function tmdbResponseToMedia(
  tmdbResponse: MovieResponse | MovieResult | ShowResponse | TvResult,
  media_type: Media_Type
): Media {
  return {
    ...tmdbResponse,
    id: tmdbResponse.id ?? -1,
    media_type,
  }
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
    response = tmdbResponseToMedia(result, mediaKey.media_type)
    cache.set(cacheKey, response)
  }

  return response
}

async function discover(media_type: Media_Type) {
  let results

  switch (media_type) {
    case Media_Type.Movie:
      results =
        (
          await cachedCall(tmdb.discoverMovie.bind(tmdb))
        ).results?.map((result) => tmdbResponseToMedia(result, media_type)) ??
        []
      break

    case Media_Type.Tv:
      results =
        (await cachedCall(tmdb.discoverTv.bind(tmdb))).results?.map((result) =>
          tmdbResponseToMedia(result, media_type)
        ) ?? []
  }

  cacheMedia(results)

  return results
}

async function recommendations(mediaKey: MediaKeyInput) {
  let results

  switch (mediaKey.media_type) {
    case Media_Type.Movie:
      results =
        (
          await cachedCall(tmdb.movieRecommendations.bind(tmdb), {
            id: mediaKey.id,
          })
        ).results?.map((result) =>
          tmdbResponseToMedia(result, mediaKey.media_type)
        ) ?? []
      break

    case Media_Type.Tv:
      results =
        (
          await cachedCall(tmdb.tvRecommendations.bind(tmdb), {
            id: mediaKey.id,
          })
        ).results?.map((result) =>
          tmdbResponseToMedia(result, mediaKey.media_type)
        ) ?? []
  }

  cacheMedia(results)

  return results
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
  recommendations: schemaComposer.createResolver<
    undefined,
    QueryMedia_RecommendationsArgs
  >({
    args: { count: 'Int!' },
    kind: 'query',
    name: 'media_recommendations',
    async resolve({ args: { count }, context }) {
      const myUser = (await user.getResolver('queries', 'findMe').resolve({
        args: {},
        context,
        projection: { votes: 1 },
      })) as User

      const exclude = Object.fromEntries(
        myUser.votes.map((vote) => [mediaKeyToCacheKey(vote.mediaId), true])
      )

      const userRecs = (
        await Promise.all(
          myUser.votes
            .sort(() => Math.random() - 0.5)
            .slice(0, count)
            .filter((vote) => vote.like)
            .map((vote) => recommendations(vote.mediaId))
        )
      ).flat()

      const discoverRecs = [
        ...(await discover(Media_Type.Movie)),
        ...(await discover(Media_Type.Tv)),
      ]

      let recs = [...userRecs, ...discoverRecs]

      recs = Object.values(
        Object.fromEntries(recs.map((rec) => [mediaKeyToCacheKey(rec), rec]))
      )

      recs = recs.filter((media) => !exclude[mediaKeyToCacheKey(media)])

      return recs.sort(() => Math.random() - 0.5).slice(0, count)
    },
    type: media.tc.getTypePlural(),
  }),
})

//* User Relations

const voteTC = schemaComposer.createObjectTC({
  fields: {
    like: 'Boolean!',
    mediaId: mediaKeyTC.getTypeNonNull(),
  },
  name: 'vote',
})

voteTC.addRelation('media', {
  prepareArgs: {
    media: (source: TDocument<Vote>) => {
      return source.toObject().mediaId
    },
  },
  projection: { mediaId: 1 },
  resolver: () => media.getResolver('queries', 'findById'),
})

user.tc.addFields({
  votes: voteTC.getTypeNonNull().getTypePlural().getTypeNonNull(),
})

export default media
