import 'dotenv-defaults/config'

const config = {
  dbUri: process.env.DB_URI ?? '',
  jwtSecret: process.env.JWT_SECRET ?? '',
  port: parseInt(process.env.PORT ?? ''),
}

export default config
