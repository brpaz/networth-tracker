import { useAccountService } from '../../services/account.service';
import { defineApiHandler } from '../../handlers';

export default defineApiHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));
  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid account ID' });
  }

  const service = useAccountService();
  await service.deleteAccount(id);

  setResponseStatus(event, 204);
  return null;
});
