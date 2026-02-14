import { useAccountService } from '../../services/account.service'

export default defineEventHandler(async () => {
  const service = useAccountService()
  return service.listAccounts()
})
