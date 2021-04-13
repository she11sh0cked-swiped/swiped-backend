import { AuthenticationError, ValidationError } from 'apollo-server-errors'
import bcrypt from 'bcrypt'
import { schemaComposer } from 'graphql-compose'
import jwt from 'jsonwebtoken'

import config from '~/config'
import {
  MutationUser_LoginArgs,
  MutationUser_RegisterArgs,
  User,
} from '~/types/generated'
import Schema from '~/utils/schema'

type TUserDB = User & {
  password: string
}

const user = new Schema<TUserDB>(
  'user',
  {
    password: { required: true, type: String },
    username: { required: true, type: String },
  },
  { compose: { removeFields: ['password'] } }
)

const userTokenTC = schemaComposer.createObjectTC({
  fields: { token: 'String!' },
  name: 'userToken',
})

const getToken = (userId: string) =>
  jwt.sign({ userId }, config.jwtSecret, { expiresIn: '1d' })

user.addFields('query', {
  findMe: schemaComposer.createResolver({
    kind: 'query',
    name: 'user_findMe',
    async resolve({ context: { userId } }) {
      const dbUser = await user.model.findById(userId)
      return dbUser
    },
    type: user.tc,
  }),
})

user.addFields('mutation', {
  login: schemaComposer.createResolver<unknown, MutationUser_LoginArgs>({
    args: { password: 'String!', username: 'String!' },
    kind: 'mutation',
    name: 'user_login',
    async resolve({ args: { password, username } }) {
      const dbUser = await user.model.findOne({ username })

      if (!dbUser) throw new AuthenticationError('user not found!')

      const isMatch = await bcrypt.compare(password, dbUser.password)
      if (!isMatch) throw new AuthenticationError('wrong password!')

      const token = getToken(dbUser.id)

      return { token }
    },
    type: userTokenTC,
  }),
  register: user.tc.mongooseResolvers
    .createOne()
    .wrap((newResolver) => {
      newResolver.addArgs({ password: 'String!' })
      return newResolver
    })
    .wrapResolve<unknown, MutationUser_RegisterArgs>((next) => async (rp) => {
      const dbUser = await user.model.findOne({
        username: rp.args.record.username,
      })

      if (dbUser) throw new ValidationError('user already exists!')

      rp.beforeRecordMutate = async (doc: TUserDB) => {
        doc.password = await bcrypt.hash(rp.args.password, 10)
        return doc
      }

      return next(rp) as Promise<User>
    }),
})

export default user
