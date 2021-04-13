import { schemaComposer } from 'graphql-compose'

import Schema from '~/utils/schema'

import user from './user'

const schemas = [user]

function fieldsWithPrepend(
  prepend: string,
  fields: ReturnType<Schema['getFields']>
) {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [`${prepend}${key}`, value])
  )
}

for (const schema of schemas) {
  schemaComposer.Query.addFields(
    fieldsWithPrepend(`${schema.name}_`, schema.getFields('queries'))
  )
  schemaComposer.Mutation.addFields(
    fieldsWithPrepend(`${schema.name}_`, schema.getFields('mutations'))
  )
  schemaComposer.Subscription.addFields(
    fieldsWithPrepend(`${schema.name}_`, schema.getFields('subscriptions'))
  )
}

export default schemaComposer.buildSchema()
