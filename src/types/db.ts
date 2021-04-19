import { Document, ObjectId } from 'mongoose'

export type TDocument<TSchema> = Document<ObjectId> & TSchema

export type TResolve<TSchema> = Promise<{ record: TDocument<TSchema> }>
