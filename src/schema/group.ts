import { ForbiddenError } from 'apollo-server-express'
import { Types } from 'mongoose'

import {
  Group,
  MutationGroup_JoinByIdArgs,
  MutationGroup_LeaveByIdArgs,
  User,
} from '~/types/api.generated'
import { TDocument, TResolve } from '~/types/db'
import Schema from '~/utils/schema'

import user from './user'

const group = new Schema<Group>('group', {
  membersId: {
    default: [],
    index: true,
    type: [{ ref: user.name, type: Types.ObjectId }],
  },
  name: { required: true, type: String },
  ownerId: { ref: user.name, required: true, type: Types.ObjectId },
})

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
    .createOne({ record: { removeFields: ['ownerId'] } })
    .wrapResolve((next) => (rp) => {
      rp.beforeRecordMutate = (doc: TDocument<Group>) => {
        const {
          context: { userId },
        } = rp

        if (doc == null) return

        const dbUserId = Types.ObjectId(userId)

        doc.ownerId = dbUserId
        doc.membersId = [dbUserId]

        return doc
      }

      return next(rp) as TResolve<Group>
    }),
  joinById: group.tc.mongooseResolvers
    .updateById()
    .wrap((resolver) => {
      resolver.removeArg('record')
      return resolver
    })
    .wrapResolve<
      undefined,
      MutationGroup_JoinByIdArgs & { record: Partial<Group> }
    >((next) => async (rp) => {
      rp.args.record = {}

      rp.beforeRecordMutate = (doc: TDocument<Group>) => {
        const {
          context: { userId },
        } = rp

        if (doc == null) return

        const dbUserId = Types.ObjectId(userId)

        if (!doc.membersId?.includes(doc.ownerId)) doc.ownerId = dbUserId
        if (!doc.membersId?.includes(dbUserId)) doc.membersId?.push(dbUserId)

        return doc
      }

      return next(rp) as TResolve<Group>
    }),
  leaveById: group.tc.mongooseResolvers
    .updateById()
    .wrap((resolver) => {
      resolver.removeArg('record')
      return resolver
    })
    .wrapResolve<
      undefined,
      MutationGroup_LeaveByIdArgs & { record: Partial<Group> }
    >((next) => async (rp) => {
      rp.args.record = {}

      rp.beforeRecordMutate = (doc: TDocument<Group>) => {
        const {
          context: { userId },
        } = rp

        if (doc == null) return

        const dbUserId = Types.ObjectId(userId)

        const index = doc.membersId?.indexOf(dbUserId) ?? -1
        if (index > -1) doc.membersId?.splice(index, 1)

        const nextOwner = doc.membersId?.[0]
        if (doc.ownerId.equals(userId) && nextOwner != null)
          doc.ownerId = nextOwner

        return doc
      }

      return next(rp) as TResolve<Group>
    }),
  updateById: group.tc.mongooseResolvers
    .updateById()
    .wrapResolve((next) => (rp) => {
      rp.beforeRecordMutate = (doc: TDocument<Group>) => {
        const {
          context: { userId },
        } = rp

        if (doc == null) return
        if (doc.ownerId.toHexString() != userId)
          throw new ForbiddenError('you are not the owner of this group!')

        return doc
      }

      return next(rp) as TResolve<Group>
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
