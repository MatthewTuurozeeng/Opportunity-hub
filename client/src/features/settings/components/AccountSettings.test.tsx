// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthContext } from '@/features/auth/context/authContext'
import { changePassword, requestEmailChange } from '@/features/auth/services/auth.service'
import { renderWithProviders } from '@/test/renderWithProviders'

import { AccountSettings } from './AccountSettings'

vi.mock('@/features/auth/services/auth.service', () => ({
  changePassword: vi.fn(),
  requestEmailChange: vi.fn(),
  signOut: vi.fn(),
  signOutEverywhere: vi.fn(),
}))

const changePasswordMock = vi.mocked(changePassword)
const requestEmailChangeMock = vi.mocked(requestEmailChange)

function renderAccountSettings() {
  renderWithProviders(
    <AuthContext.Provider
      value={{ session: null, user: { id: 'user-1', email: 'owner@example.com' } as never, isLoading: false }}
    >
      <AccountSettings />
    </AuthContext.Provider>,
  )
  return userEvent.setup()
}

async function fillPasswordForm(user: ReturnType<typeof userEvent.setup>, current: string, next: string, confirm = next) {
  await user.type(screen.getByLabelText(/^Current password/), current)
  await user.type(screen.getByLabelText(/^New password/), next)
  await user.type(screen.getByLabelText(/^Confirm new password/), confirm)
  await user.click(screen.getByRole('button', { name: 'Change password' }))
}

describe('AccountSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('changes the password after confirming the current one', async () => {
    changePasswordMock.mockResolvedValue(undefined)
    const user = renderAccountSettings()

    await fillPasswordForm(user, 'OldPassword1', 'NewPassword22')

    await vi.waitFor(() =>
      expect(changePasswordMock.mock.calls[0][0]).toEqual({
        email: 'owner@example.com',
        currentPassword: 'OldPassword1',
        newPassword: 'NewPassword22',
      }),
    )
    await vi.waitFor(() => expect(screen.getByLabelText(/^Current password/)).toHaveValue(''))
  })

  it('shows the error when the current password is wrong', async () => {
    changePasswordMock.mockRejectedValue(new Error('Your current password is incorrect.'))
    const user = renderAccountSettings()

    await fillPasswordForm(user, 'WrongPassword1', 'NewPassword22')

    expect(await screen.findByRole('alert')).toHaveTextContent('Your current password is incorrect.')
  })

  it('blocks weak or mismatched new passwords before calling the server', async () => {
    const user = renderAccountSettings()

    await fillPasswordForm(user, 'OldPassword1', 'weak', 'different')

    expect(await screen.findByText('Use at least 10 characters.')).toBeInTheDocument()
    expect(screen.getByText('Passwords do not match.')).toBeInTheDocument()
    expect(changePasswordMock).not.toHaveBeenCalled()
  })

  it('sends an email change confirmation and explains what happens next', async () => {
    requestEmailChangeMock.mockResolvedValue(undefined)
    const user = renderAccountSettings()

    await user.type(screen.getByLabelText('New email address'), 'new@example.com')
    await user.click(screen.getByRole('button', { name: 'Send confirmation' }))

    await vi.waitFor(() => expect(requestEmailChangeMock.mock.calls[0][0]).toBe('new@example.com'))
    expect(await screen.findByRole('status')).toHaveTextContent('Check new@example.com for a confirmation link')
  })
})
