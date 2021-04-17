import express, { Express } from 'express'
import { join, resolve } from 'path'

import config from '~/config'

function applyClient(app: Express): void {
  app.use(express.static(resolve(config.client)))

  app.get('*', (_req, res) => {
    console.log(join(resolve(config.client), 'index.html'))
    res.sendFile(join(resolve(config.client), 'index.html'))
  })
}

export { applyClient }
