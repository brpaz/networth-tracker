import { useAccountService } from '../../services/account.service'
import { updateAccountSchema } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid account ID' })
  }

  const body = await readBody(event)
  const data = updateAccountSchema.parse(body)

  const service = useAccountService()
  return service.updateAccount(id, data)
})
