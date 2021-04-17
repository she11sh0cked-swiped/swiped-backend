import express, { Express } from 'express'
import { join, resolve } from 'path'

import config from '~/config'

function applyClient(app: Express): void {
  app.use(express.static(resolve(config.client)))

  app.get('*', (_req, res) => {
    res.sendFile(join(resolve(config.client), 'index.html'))
  })
}

export { applyClient }
