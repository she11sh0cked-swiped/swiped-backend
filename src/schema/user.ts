import { AuthenticationError, ValidationError } from 'apollo-server-errors'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

import config from '~/config'
import {
  MutationUser_CreateOneArgs,
  MutationUser_LoginArgs,
  User,
  Vote,
} from '~/types/api.generated'
import { TDocument, TResolve } from '~/types/db'
import { schemaComposer } from '~/utils/graphql'
import { dbSchemaFactory } from '~/utils/schema'

import media, { mediaKeyTC } from './media'

type TUserDB = User & {
  password: string
}

const voteSchema = new mongoose.Schema(
  {
    like: mongoose.SchemaTypes.Boolean,
    mediaId: {
      id: mongoose.SchemaTypes.Number,
      media_type: mongoose.SchemaTypes.String,
    },
  },
  { _id: false }
)

const user = dbSchemaFactory<TUserDB>(
  'user',
  {
    password: { required: true, type: String },
    username: { required: true, type: String, unique: true },
    votes: { default: [], type: [voteSchema] },
  },
  {
    compose: {
      removeFields: ['password'],
    },
  }
)

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
