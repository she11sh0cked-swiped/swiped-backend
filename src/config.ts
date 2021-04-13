import 'dotenv-defaults/config'

const config = {
  dbUri: process.env.DB_URI ?? '',
}

export default config
