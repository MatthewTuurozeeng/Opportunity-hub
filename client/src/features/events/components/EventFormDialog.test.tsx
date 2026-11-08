// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '@/test/renderWithProviders'

import { createApplicationEvent } from '../services/event.service'
import { EventFormDialog } from './EventFormDialog'

vi.mock('../services/event.service', () => ({
  createApplicationEvent: vi.fn(),
  updateApplicationEvent: vi.fn(),
}))

vi.mock('@/features/applications/services/application.service', () => ({
  listApplications: vi.fn().mockResolvedValue([]),
}))

const createEventMock = vi.mocked(createApplicationEvent)

function renderDialog() {
  const onOpenChange = vi.fn()
  renderWithProviders(<EventFormDialog fixedApplicationId="application-1" isOpen onOpenChange={onOpenChange} />)
  return { onOpenChange, user: userEvent.setup() }
}

describe('EventFormDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('hides the application picker when the application is fixed', () => {
    renderDialog()
    expect(screen.queryByLabelText(/^Application/)).not.toBeInTheDocument()
  })

  it('requires a date, and a start time unless the event is all day', async () => {
    const { user } = renderDialog()

    await user.click(screen.getByRole('button', { name: 'Add event' }))
    expect(await screen.findByText('Choose a date.')).toBeInTheDocument()

    await user.type(screen.getByLabelText(/^Date/), '2026-11-20')
    await user.click(screen.getByRole('button', { name: 'Add event' }))
    expect(await screen.findByText(/Choose a start time, or mark the event as all day/)).toBeInTheDocument()
    expect(createEventMock).not.toHaveBeenCalled()
  })

  it('saves an all-day event for the application, titled after its type', async () => {
    createEventMock.mockResolvedValue(undefined)
    const { onOpenChange, user } = renderDialog()

    await user.selectOptions(screen.getByLabelText(/^Type/), 'follow_up_reminder')
    await user.type(screen.getByLabelText(/^Date/), '2026-11-20')
    await user.click(screen.getByLabelText(/All day/))
    expect(screen.queryByLabelText(/Start time/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Add event' }))

    await vi.waitFor(() => expect(createEventMock).toHaveBeenCalledTimes(1))
    expect(createEventMock.mock.calls[0][0]).toMatchObject({
      application_id: 'application-1',
      event_type: 'follow_up_reminder',
      title: 'Follow-up reminder',
      is_all_day: true,
      ends_at: null,
    })
    await vi.waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
  })
})
