import { AuthenticationError, ValidationError } from 'apollo-server-errors'
import bcrypt from 'bcrypt'
import { schemaComposer } from 'graphql-compose'
import jwt from 'jsonwebtoken'

import config from '~/config'
import {
  MutationUser_LoginArgs,
  MutationUser_RegisterArgs,
  User,
} from '~/types/api'
import { TDocument } from '~/types/db'
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

const userWithTokenTC = user.tc
  .clone('userWithToken')
  .addFields({ token: 'String!' })

const getToken = (userId: string) =>
  jwt.sign({ userId }, config.jwtSecret, { expiresIn: '1d' })

const registerUser = (
  username: string,
  password: string
): Promise<TDocument<TUserDB>> =>
  (user.tc.mongooseResolvers
    .createOne()
    .wrapResolve<unknown, { record: { username: string } }>((next) => (rp) => {
      rp.beforeRecordMutate = async (doc: TUserDB) => {
        doc.password = await bcrypt.hash(password, 10)
        return doc
      }
      return next(rp) as Promise<TUserDB>
    })
    .resolve({ args: { record: { username } } }) as Promise<{
    record: TDocument<TUserDB>
  }>).then((value) => value.record)

user.addFields('queries', {
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

user.addFields('mutations', {
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

      return { ...dbUser.toObject(), token }
    },
    type: userWithTokenTC,
  }),
  register: schemaComposer.createResolver<unknown, MutationUser_RegisterArgs>({
    args: { password: 'String!', username: 'String!' },
    kind: 'mutation',
    name: 'user_register',
    async resolve({ args: { password, username } }) {
      const dbUser = await user.model.findOne({ username })

      if (dbUser) throw new ValidationError('user already exists!')

      const newDbUser = await registerUser(username, password)

      const token = getToken(newDbUser.id)

      return { ...newDbUser.toObject(), token }
    },
    type: userWithTokenTC,
  }),
})

export default user
