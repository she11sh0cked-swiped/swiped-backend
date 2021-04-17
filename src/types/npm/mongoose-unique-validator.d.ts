declare module 'mongoose-unique-validator' {
  import { Schema } from 'mongoose'

  interface IUniqueValidatorOptions {
    message?: string
    type?: string
  }

  const uniqueValidator: (
    schema: Schema,
    opts?: IUniqueValidatorOptions
  ) => void

  export type { IUniqueValidatorOptions }
  export default uniqueValidator
}
