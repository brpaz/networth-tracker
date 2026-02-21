import { useAccountService } from '../../services/account.service';
import { defineApiHandler } from '../../handlers';

export default defineApiHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));
  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid account ID' });
  }

  const service = useAccountService();
  return service.getAccount(id);
});
