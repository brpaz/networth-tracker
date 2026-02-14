import { useAccountService } from '../../services/account.service'
import { createAccountSchema } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const data = createAccountSchema.parse(body)

  const service = useAccountService()
  const account = await service.createAccount(data)

  setResponseStatus(event, 201)
  return account
})
