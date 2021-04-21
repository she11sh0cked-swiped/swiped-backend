import mongoose from 'mongoose'
import uniqueValidator from 'mongoose-unique-validator'

import config from './config'
import logger from './utils/logger'

mongoose.plugin(uniqueValidator)
mongoose.set('debug', logger)

void mongoose.connect(config.dbUri, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

const db = mongoose.connection

export default db
