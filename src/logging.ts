import { Request } from 'express'
import morgan from 'morgan'

import { getOperationName, getOperationType } from '~/utils/graphql'

morgan.token<
  Request<
    unknown,
    unknown,
    { operationName: string; query: string; variables: Record<string, unknown> }
  >
>('graphql', (req) => {
  const type = getOperationType(req.body.query)
  const name = getOperationName(req.body.query)

  return `GRAPHQL
⤷ Type: ${type}
⤷ Name: ${name}`
})

const api = morgan<Request>(':graphql', {
  skip: (req) => req.originalUrl !== '/graphql',
})

export default { api }
