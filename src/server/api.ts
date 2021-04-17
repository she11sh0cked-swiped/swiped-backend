import {
  ApolloServer,
  AuthenticationError,
  ExpressContext,
} from 'apollo-server-express'
import { Express } from 'express'
import jwt from 'jsonwebtoken'

import config from '~/config'
import logging from '~/logging'
import schema from '~/schema'
import { IContext } from '~/types/graphql'
import { getOperationName } from '~/utils/graphql'

type TDecodedJWT = IContext | string

function getUserId(token: string) {
  const decoded = jwt.verify(token, config.jwtSecret) as TDecodedJWT
  if (typeof decoded === 'string') {
    new AuthenticationError(decoded)
    return
  }
  return decoded.userId
}

const whitelist = ['user_login', 'user_createOne', '__schema']

const context = ({
  req: {
    body: { query },
    headers,
  },
}: ExpressContext) => {
  const operationName = getOperationName(query)
  if (whitelist.includes(operationName)) return {}

  const token = (headers.authorization ?? '').split('Bearer ')[1]
  if (!token) throw new AuthenticationError('you should provide a token!')

  const userId = getUserId(token)

  return { userId }
}

const api = new ApolloServer({
  context,
  schema,
})

function applyApi(app: Express): void {
  app.use(logging.api)
  api.applyMiddleware({ app })
}

export { applyApi }
export default api
