import express from 'express'

import apollo from './apollo'
import db from './database'

const app = express()

apollo.applyMiddleware({ app })

db.once('open', () => {
  app.listen({ port: process.env.PORT })
})
