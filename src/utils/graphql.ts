import { gql } from 'apollo-server-core'
import { FragmentSpreadNode, OperationDefinitionNode } from 'graphql'
import {
  SchemaComposer,
  schemaComposer as _schemaComposer,
} from 'graphql-compose'

import { IContext } from '~/types/graphql'

export function getOperationName(query: string): string {
  const ast = gql(query)
  const operation = ast.definitions[0] as OperationDefinitionNode
  const fragment = operation.selectionSet.selections[0] as FragmentSpreadNode
  const name = fragment.name.value

  return name
}

export function getOperationType(query: string): string {
  const ast = gql(query)
  const operation = ast.definitions[0] as OperationDefinitionNode
  const type = operation.operation

  return type
}

export const schemaComposer = _schemaComposer as SchemaComposer<IContext>
