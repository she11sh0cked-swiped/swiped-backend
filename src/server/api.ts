import { ApolloServer } from 'apollo-server-express'
import { Express } from 'express'

import schema from '~/schema'

const api = new ApolloServer({
  schema: schema,
})

function applyApi(app: Express): void {
  api.applyMiddleware({ app })
}

export { applyApi }
export default api
