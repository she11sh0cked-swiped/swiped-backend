import { Document, ObjectId } from 'mongoose'

export type TDocument<TSchema> = Document<ObjectId> & TSchema
