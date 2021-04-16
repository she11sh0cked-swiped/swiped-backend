import 'dotenv-defaults/config'

const config = {
  client: process.env.CLIENT ?? '',
  dbUri: process.env.DB_URI ?? '',
  jwtSecret: process.env.JWT_SECRET ?? '',
  port: parseInt(process.env.PORT ?? ''),
}

export default config
