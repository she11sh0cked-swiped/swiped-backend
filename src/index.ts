import './database'

import express from 'express'
import morgan from 'morgan'

import apollo from './apollo'
import config from './config'
import logging from './logging'

const app = express()

app.use(morgan('combined'))

app.use(logging.api)
apollo.applyMiddleware({ app })

app.listen({ port: process.env.PORT }, () => {
  console.log(`🚀 Launching!
graphql http://localhost:${config.port}${apollo.graphqlPath}`)
})
