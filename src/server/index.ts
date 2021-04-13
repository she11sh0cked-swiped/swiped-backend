import express from 'express'

import config from '~/config'

import api, { applyApi } from './api'

const app = express()

applyApi(app)

app.listen({ port: process.env.PORT }, () => {
  console.log(`🚀 Launching!
graphql http://localhost:${config.port}${api.graphqlPath}`)
})
