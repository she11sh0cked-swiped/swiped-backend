import { ObjectTypeComposer, Resolver } from 'graphql-compose'
import {
  composeMongoose,
  ComposeMongooseOpts,
  GenerateResolverType,
} from 'graphql-compose-mongoose'
import mongoose from 'mongoose'

import { TDocument } from '~/types/db'

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

  schema: mongoose.Schema
  model: mongoose.Model<TDocument<TSchema>>
  tc: ObjectTypeComposer<TDocument<TSchema>, unknown> & {
    mongooseResolvers: GenerateResolverType<TDocument<TSchema>, unknown>
  }

  constructor(
    public name: string,
    definition: mongoose.SchemaDefinition,
    options: IOptions = {}
  ) {
    this.name = name
    this.schema = new mongoose.Schema(definition, options.schema)
    this.model = mongoose.model<TDocument<TSchema>>(this.name, this.schema)
    this.tc = composeMongoose<TDocument<TSchema>>(this.model, options.compose)
  }

  addFields(type: keyof IFields, fields: IFieldMap): void {
    Object.assign(this.#fields[type], fields)
  }

  getFields(type: keyof IFields): IFieldMap {
    return this.#fields[type]
  }
}

export default Schema
