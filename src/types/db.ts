import { Document } from 'mongoose'

export type TDocument<TSchema> = Document & TSchema
