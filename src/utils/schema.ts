import {
  NamedTypeComposer,
  ObjectTypeComposer,
  Resolver,
} from 'graphql-compose'
import {
  composeMongoose,
  ComposeMongooseOpts,
  GenerateResolverType,
} from 'graphql-compose-mongoose'
import mongoose from 'mongoose'

import { TDocument } from '~/types/db'
import { IContext } from '~/types/graphql'

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
  TTypeComposer extends NamedTypeComposer<IContext> = NamedTypeComposer<IContext>
> {
  #fields: IFields = {
    mutations: {},
    queries: {},
    subscriptions: {},
  }

  constructor(public tc: TTypeComposer) {}

  public get name(): string {
    return this.tc.getTypeName()
  }

  addFields(type: keyof IFields, fields: IFieldMap): void {
    Object.assign(this.#fields[type], fields)
  }

  getFields(type: keyof IFields): IFieldMap {
    return this.#fields[type]
  }
}

type TDBSchema<TSchema> = Schema<
  ObjectTypeComposer<TDocument<TSchema>, IContext> & {
    mongooseResolvers: GenerateResolverType<TDocument<TSchema>, IContext>
  }
>

export function dbSchemaFactory<
  TSchema extends Record<string, unknown> = Record<string, unknown>
>(
  name: string,
  definition: mongoose.SchemaDefinition,
  options: IOptions = {}
): TDBSchema<TSchema> {
  const dbSchema = new mongoose.Schema(definition, options?.schema)
  const model = mongoose.model(name, dbSchema)
  const tc = composeMongoose(model, options?.compose)

  return new Schema(tc) as TDBSchema<TSchema>
}

export default Schema
