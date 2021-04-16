import express from 'express'
import morgan from 'morgan'

import config from '~/config'

import api, { applyApi } from './api'
import { applyClient } from './client'

const app = express()

app.use(morgan('combined'))

applyClient(app)
applyApi(app)

app.listen({ port: process.env.PORT }, () => {
  console.log(`🚀 Launching!
graphql http://localhost:${config.port}${api.graphqlPath}`)
})
