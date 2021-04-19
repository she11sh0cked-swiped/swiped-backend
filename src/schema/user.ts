import { AuthenticationError, ValidationError } from 'apollo-server-errors'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import config from '~/config'
import {
  MutationUser_CreateOneArgs,
  MutationUser_LoginArgs,
  User,
} from '~/types/api.generated'
import { TDocument, TResolve } from '~/types/db'
import { schemaComposer } from '~/utils/graphql'
import Schema from '~/utils/schema'

type TUserDB = User & {
  password: string
}

const user = new Schema<TUserDB>(
  'user',
  {
    password: { required: true, type: String },
    username: { required: true, type: String, unique: true },
  },
  { compose: { removeFields: ['password'] } }
)

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
        const { confirmPassword, password } = rp.args

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
})

export default user
