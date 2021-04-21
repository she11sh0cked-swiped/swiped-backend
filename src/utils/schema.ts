import { ObjectTypeComposer, Resolver } from 'graphql-compose'
import {
  composeMongoose,
  ComposeMongooseOpts,
  GenerateResolverType,
} from 'graphql-compose-mongoose'
import mongoose from 'mongoose'

import { TDocument } from '~/types/db'
import { IContext } from '~/types/graphql'

import { schemaComposer } from './graphql'

type IFieldMap = Record<string, Resolver>

interface IFields {
  mutations: IFieldMap
  queries: IFieldMap
  subscriptions: IFieldMap
}

interface IOptions {
  compose?: ComposeMongooseOpts
  schema?: mongoose.SchemaOptions
}

class Schema<
  TSchema extends Record<string, unknown> = Record<string, unknown>
> {
  #fields: IFields = {
    mutations: {},
    queries: {},
    subscriptions: {},
  }

  tc: ObjectTypeComposer<TSchema, IContext>

  constructor(public name: string) {
    this.tc = schemaComposer.createObjectTC({ name })
  }

  addFields(type: keyof IFields, fields: IFieldMap): void {
    Object.assign(this.#fields[type], fields)
  }

  getFields(type: keyof IFields): IFieldMap {
    return this.#fields[type]
  }
}

type TDBSchema<TSchema> = Omit<Schema, 'tc'> & {
  tc: ObjectTypeComposer<TDocument<TSchema>, IContext> & {
    mongooseResolvers: GenerateResolverType<TDocument<TSchema>, IContext>
  }
}

export function dbSchemaFactory<
  TSchema extends Record<string, unknown> = Record<string, unknown>
>(
  name: string,
  definition: mongoose.SchemaDefinition,
  options: IOptions = {}
): TDBSchema<TDocument<TSchema>> {
  const dbSchema = new mongoose.Schema(definition, options?.schema)
  const model = mongoose.model<TDocument<TSchema>>(name, dbSchema)
  const tc = composeMongoose<TDocument<TSchema>>(model, options?.compose)

  const schema = new Schema<TDocument<TSchema>>(name)
  schema.tc = tc

  return (schema as unknown) as TDBSchema<TDocument<TSchema>>
}

export default Schema
