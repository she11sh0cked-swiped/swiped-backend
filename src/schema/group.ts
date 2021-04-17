import { Types } from 'mongoose'

import { Group, User } from '~/types/api.generated'
import { TDocument } from '~/types/db'
import Schema from '~/utils/schema'

import user from './user'

const group = new Schema<Group>(
  'group',
  {
    membersId: {
      default: [],
      index: true,
      type: [{ ref: user.name, type: Types.ObjectId }],
    },
    name: { required: true, type: String },
    ownerId: { ref: user.name, required: true, type: Types.ObjectId },
  },
  { compose: { inputType: { removeFields: ['ownerId'] } } }
)

group.tc.addRelation('owner', {
  prepareArgs: {
    _id: (source) => source.ownerId,
  },
  projection: { ownerId: 1 },
  resolver: () => user.tc.mongooseResolvers.dataLoader(),
})

group.tc.addRelation('members', {
  prepareArgs: {
    _ids: (source) => source.membersId,
  },
  projection: { membersId: 1 },
  resolver: () => user.tc.mongooseResolvers.dataLoaderMany(),
})

group.addFields('queries', {
  findById: group.tc.mongooseResolvers.findById(),
})

group.addFields('mutations', {
  createOne: group.tc.mongooseResolvers
    .createOne()
    .wrapResolve((next) => (rp) => {
      rp.beforeRecordMutate = (doc: TDocument<Group>) => {
        if (doc.membersId == null) doc.membersId = []
        doc.ownerId = Types.ObjectId(rp.context.userId)

        doc.membersId.push(doc.ownerId)

        return doc
      }

      return next(rp) as Promise<{ record: Group }>
    }),
})

//* User relations

function getUserGroups(user: User) {
  const groups = group.tc.mongooseResolvers.findMany().resolve({
    args: {
      filter: {
        _operators: { membersId: { in: user._id } },
      },
    },
  }) as Promise<TDocument<Group>[]>
  return groups
}

user.tc.addRelation('groupsId', {
  projection: { _id: 1 },
  resolve: (dbUser, _args, _context, _info) =>
    getUserGroups(dbUser).then((groups) => groups.map((group) => group._id)),
  type: '[MongoID]!',
})

user.tc.addRelation('groups', {
  projection: { _id: 1 },
  resolve: getUserGroups,
  type: group.tc.getTypePlural().getTypeNonNull(),
})

export default group
