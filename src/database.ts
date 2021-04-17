import mongoose from 'mongoose'
import uniqueValidator from 'mongoose-unique-validator'

import config from './config'

mongoose.plugin(uniqueValidator)

void mongoose.connect(config.dbUri, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
