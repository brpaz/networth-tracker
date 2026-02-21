import { z } from 'zod';
import { useSnapshotService } from '../../services/snapshot.service';
import { defineApiHandler } from '../../handlers';

const createSnapshotSchema = z.object({
  accountId: z.number().int().positive(),
  value: z.number(),
});

export default defineApiHandler(async (event) => {
  const body = await readBody(event);
  const data = createSnapshotSchema.parse(body);

  const service = useSnapshotService();
  const snapshot = await service.recordSnapshot(data);

  setResponseStatus(event, 201);
  return snapshot;
});
