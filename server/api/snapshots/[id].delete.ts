import { useSnapshotService } from '../../services/snapshot.service';
import { defineApiHandler } from '../../handlers';

export default defineApiHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));
  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid snapshot ID' });
  }

  const service = useSnapshotService();
  await service.deleteSnapshot(id);

  setResponseStatus(event, 204);
  return null;
});
