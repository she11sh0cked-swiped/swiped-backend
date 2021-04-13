import mongoose from 'mongoose'

import config from './config'

void mongoose.connect(config.dbUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
