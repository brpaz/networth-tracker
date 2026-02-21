import { z } from 'zod';
import { useAccountService } from '../../services/account.service';
import { defineApiHandler } from '../../handlers';
import { accountTypes } from '../../database/schema';

const updateAccountSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(accountTypes).optional(),
  currency: z.string().length(3).optional(),
});

export default defineApiHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));
  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid account ID' });
  }

  const body = await readBody(event);
  const data = updateAccountSchema.parse(body);

  const service = useAccountService();
  return service.updateAccount(id, data);
});
