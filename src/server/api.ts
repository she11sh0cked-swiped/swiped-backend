import {
  ApolloServer,
  AuthenticationError,
  ExpressContext,
  gql,
} from 'apollo-server-express'
import { Express } from 'express'
import { FragmentSpreadNode, OperationDefinitionNode } from 'graphql'
import jwt from 'jsonwebtoken'

import config from '~/config'
import schema from '~/schema'

type TDecodedJWT = string | { userId: string }

function getUserId(token: string) {
  const decoded = jwt.verify(token, config.jwtSecret) as TDecodedJWT
  if (typeof decoded === 'string') {
    new AuthenticationError(decoded)
    return
  }
  return decoded.userId
}

function getOperationName(query: string) {
  const ast = gql(query)
  const operation = ast.definitions[0] as OperationDefinitionNode
  const fragment = operation.selectionSet.selections[0] as FragmentSpreadNode
  const name = fragment.name.value

  return name
}

const whitelist = ['user_login', 'user_register', '__schema']

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
  api.applyMiddleware({ app })
}

export { applyApi }
export default api
