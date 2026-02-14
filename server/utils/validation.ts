import { z } from 'zod'
import { accountTypes } from '../database/schema'

export const createAccountSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(accountTypes),
  currency: z.string().length(3).default('EUR'),
})

export const updateAccountSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(accountTypes).optional(),
  currency: z.string().length(3).optional(),
})

export const createSnapshotSchema = z.object({
  accountId: z.number().int().positive(),
  value: z.number(),
})
