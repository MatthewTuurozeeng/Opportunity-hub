// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '@/test/renderWithProviders'

import { changeApplicationStatus } from '../services/application.service'
import { ChangeStatusDialog } from './ChangeStatusDialog'

vi.mock('../services/application.service', () => ({
  changeApplicationStatus: vi.fn(),
}))

const changeApplicationStatusMock = vi.mocked(changeApplicationStatus)

describe('ChangeStatusDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('cannot save until a different status is chosen', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ChangeStatusDialog applicationId="application-1" currentStatus="submitted" />)

    await user.click(screen.getByRole('button', { name: 'Change status' }))

    expect(await screen.findByRole('button', { name: 'Save status' })).toBeDisabled()
  })

  it('saves the new status with its note and closes', async () => {
    changeApplicationStatusMock.mockResolvedValue(undefined)
    const user = userEvent.setup()
    renderWithProviders(<ChangeStatusDialog applicationId="application-1" currentStatus="submitted" />)

    await user.click(screen.getByRole('button', { name: 'Change status' }))
    await user.selectOptions(await screen.findByLabelText('New status'), 'interview')
    await user.type(screen.getByLabelText('Note (optional)'), 'Invitation received by email.')
    await user.click(screen.getByRole('button', { name: 'Save status' }))

    await vi.waitFor(() =>
      expect(changeApplicationStatusMock).toHaveBeenCalledWith('application-1', 'interview', 'Invitation received by email.'),
    )
    await vi.waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('keeps the dialog open and shows the error when saving fails', async () => {
    changeApplicationStatusMock.mockRejectedValue(new Error('Unable to update the status. Please try again.'))
    const user = userEvent.setup()
    renderWithProviders(<ChangeStatusDialog applicationId="application-1" currentStatus="submitted" />)

    await user.click(screen.getByRole('button', { name: 'Change status' }))
    await user.selectOptions(await screen.findByLabelText('New status'), 'unsuccessful')
    await user.click(screen.getByRole('button', { name: 'Save status' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to update the status')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
