import { useSnapshotService } from '../../../services/snapshot.service'

export default defineEventHandler(async (event) => {
  const accountId = Number(getRouterParam(event, 'id'))
  if (!accountId || isNaN(accountId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid account ID' })
  }

  const query = getQuery(event)
  const limit = Number(query.limit) || 100

  const service = useSnapshotService()
  return service.getAccountSnapshots(accountId, limit)
})
