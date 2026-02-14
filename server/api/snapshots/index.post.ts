import { useSnapshotService } from '../../services/snapshot.service'
import { createSnapshotSchema } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const data = createSnapshotSchema.parse(body)

  const service = useSnapshotService()
  const snapshot = await service.recordSnapshot(data)

  setResponseStatus(event, 201)
  return snapshot
})
