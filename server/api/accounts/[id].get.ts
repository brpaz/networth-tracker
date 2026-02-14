import { useAccountService } from '../../services/account.service'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid account ID' })
  }

  const service = useAccountService()
  return service.getAccount(id)
})
