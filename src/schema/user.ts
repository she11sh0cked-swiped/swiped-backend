import { AuthenticationError, ValidationError } from 'apollo-server-errors'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

import config from '~/config'
import {
  MediaInput,
  MutationUser_CreateOneArgs,
  MutationUser_LoginArgs,
  User,
} from '~/types/api.generated'
import { TDocument, TResolve } from '~/types/db'
import { schemaComposer } from '~/utils/graphql'
import { dbSchemaFactory } from '~/utils/schema'

import media, { findMediaById } from './media'

type TUserDB = User & {
  password: string
}

const mediaSchema = new mongoose.Schema(
  {
    id: mongoose.SchemaTypes.Number,
    media_type: mongoose.SchemaTypes.String,
  },
  { _id: false }
)

const user = dbSchemaFactory<TUserDB>(
  'user',
  {
    media: {
      dislikesId: { default: [], type: [mediaSchema] },
      likesId: { default: [], type: [mediaSchema] },
    },
    password: { required: true, type: String },
    username: { required: true, type: String, unique: true },
  },
  {
    compose: {
      inputType: { removeFields: ['media'] },
      removeFields: ['password'],
    },
  }
)

const userMediaInputTC = schemaComposer.createInputTC({
  fields: {
    dislikesId: media.tc.getInputType(),
    likesId: media.tc.getInputType(),
  },
  name: 'userMediaInput',
})

user.tc.getInputTypeComposer().addFields({
  media: userMediaInputTC,
})

user.tc
  .getFieldOTC('media')
  .addRelation('dislikes', {
    projection: { dislikesId: 1 },
    resolve(dbUser) {
      const dislikes =
        dbUser.media?.dislikesId?.map<MediaInput>((media) => ({
          id: media?.id as MediaInput['id'],
          media_type: media?.media_type as MediaInput['media_type'],
        })) ?? []

      return Promise.all(dislikes.map(findMediaById))
    },
    type: media.tc.getTypePlural(),
  })
  .addRelation('likes', {
    projection: { likesId: 1 },
    resolve(dbUser) {
      const likes =
        dbUser.media?.likesId?.map<MediaInput>((media) => ({
          id: media?.id as MediaInput['id'],
          media_type: media?.media_type as MediaInput['media_type'],
        })) ?? []

      return Promise.all(likes.map(findMediaById))
    },
    type: media.tc.getTypePlural(),
  })

user.addFields('queries', {
  findMe: user.tc.mongooseResolvers
    .findById()
    .wrap((resolver) => {
      resolver.removeArg('_id')
      return resolver
    })
    .wrapResolve<undefined, { _id: string }>((next) => async (rp) => {
      const {
        context: { userId },
      } = rp

      rp.args._id = userId

      return next(rp) as TResolve<User>
    }),
})

user.addFields('mutations', {
  createOne: user.tc.mongooseResolvers
    .createOne()
    .wrap((resolver) => {
      resolver.addArgs({ confirmPassword: 'String!', password: 'String!' })
      return resolver
    })
    .wrapResolve<undefined, MutationUser_CreateOneArgs>((next) => (rp) => {
      rp.beforeRecordMutate = async (doc: TDocument<TUserDB>) => {
        const {
          args: { confirmPassword, password },
        } = rp

        if (doc == null) return

        if (password !== confirmPassword)
          throw new ValidationError('passwords do not match!')

        doc.password = await bcrypt.hash(password, 10)

        return doc
      }

      return next(rp) as TResolve<TUserDB>
    }),
  login: schemaComposer.createResolver<undefined, MutationUser_LoginArgs>({
    args: { password: 'String!', username: 'String!' },
    kind: 'mutation',
    name: 'user_login',
    async resolve({ args: { password, username } }) {
      const dbUser = await (user.tc.mongooseResolvers
        .findOne()
        .resolve({ args: { filter: { username } } }) as Promise<TUserDB>)

      if (!dbUser) throw new AuthenticationError('user not found!')

      const isMatch = await bcrypt.compare(password, dbUser.password)
      if (!isMatch) throw new AuthenticationError('wrong password!')

      const token = jwt.sign({ userId: dbUser._id }, config.jwtSecret, {
        expiresIn: '1d',
      })

      return { token }
    },
    type: schemaComposer.createObjectTC({
      fields: {
        token: 'String!',
      },
      name: 'token',
    }),
  }),
  updateMe: user.tc.mongooseResolvers
    .updateById()
    .wrap((resolver) => {
      resolver.removeArg('_id')
      return resolver
    })
    .wrapResolve<undefined>((next) => (rp) => {
      rp.args._id = rp.context.userId
      return next(rp) as TResolve<TUserDB>
    }),
})

export default user
