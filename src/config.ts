import 'dotenv-defaults/config'

const config = {
  dbUri: process.env.DB_URI ?? '',
  port: parseInt(process.env.PORT ?? ''),
}

export default config
