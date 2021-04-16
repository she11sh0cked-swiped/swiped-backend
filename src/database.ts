import mongoose from 'mongoose'

import config from './config'

void mongoose.connect(config.dbUri, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
