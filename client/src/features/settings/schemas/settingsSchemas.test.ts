import { describe, expect, it } from 'vitest'

import { buildEmailChangeSchema, categoryNameSchema, passwordChangeSchema } from './settingsSchemas'

function passwordErrors(values: { currentPassword: string; newPassword: string; confirmPassword: string }) {
  const result = passwordChangeSchema.safeParse(values)
  return result.success ? [] : result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`)
}

describe('passwordChangeSchema', () => {
  it('accepts a strong, confirmed, new password', () => {
    expect(passwordErrors({ currentPassword: 'OldPassword1', newPassword: 'NewPassword22', confirmPassword: 'NewPassword22' })).toEqual([])
  })

  it('applies the same strength rules as sign-up', () => {
    expect(passwordErrors({ currentPassword: 'OldPassword1', newPassword: 'short', confirmPassword: 'short' })).toContain(
      'newPassword: Use at least 10 characters.',
    )
    expect(
      passwordErrors({ currentPassword: 'OldPassword1', newPassword: 'alllowercase1', confirmPassword: 'alllowercase1' }),
    ).toContain('newPassword: Include an uppercase letter.')
  })

  it('requires a matching confirmation and a different password', () => {
    expect(passwordErrors({ currentPassword: 'OldPassword1', newPassword: 'NewPassword22', confirmPassword: 'Other' })).toContain(
      'confirmPassword: Passwords do not match.',
    )
    expect(
      passwordErrors({ currentPassword: 'SamePassword1', newPassword: 'SamePassword1', confirmPassword: 'SamePassword1' }),
    ).toContain('newPassword: Choose a password different from your current one.')
  })
})

describe('buildEmailChangeSchema', () => {
  const schema = buildEmailChangeSchema('owner@example.com')

  it('rejects invalid addresses and the current address in any case', () => {
    expect(schema.safeParse({ email: 'not-an-email' }).success).toBe(false)
    expect(schema.safeParse({ email: 'OWNER@example.com' }).success).toBe(false)
    expect(schema.safeParse({ email: 'new@example.com' }).success).toBe(true)
  })
})

describe('categoryNameSchema', () => {
  it('trims and limits names', () => {
    expect(categoryNameSchema.parse('  Research  ')).toBe('Research')
    expect(categoryNameSchema.safeParse('   ').success).toBe(false)
    expect(categoryNameSchema.safeParse('x'.repeat(61)).success).toBe(false)
  })
})
