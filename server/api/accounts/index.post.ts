import { z } from 'zod';
import { useAccountService } from '../../services/account.service';
import { accountTypes } from '../../database/schema';

const createAccountSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(accountTypes),
  currency: z.string().length(3).default('EUR'),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const data = createAccountSchema.parse(body);

  const service = useAccountService();
  const account = await service.createAccount(data);

  setResponseStatus(event, 201);
  return account;
});
