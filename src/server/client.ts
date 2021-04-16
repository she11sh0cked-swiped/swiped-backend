import express, { Express } from 'express'
import { resolve } from 'path'

import config from '~/config'

function applyClient(app: Express): void {
  app.use(express.static(resolve(config.client)))
}

export { applyClient }
