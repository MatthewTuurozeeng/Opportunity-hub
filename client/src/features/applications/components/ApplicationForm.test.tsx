// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '@/test/renderWithProviders'

import { EMPTY_APPLICATION_FORM_VALUES } from '../schemas/applicationFormSchema'
import { ApplicationForm } from './ApplicationForm'

vi.mock('@/features/categories/services/category.service', () => ({
  listCategories: vi.fn().mockResolvedValue([{ id: 'category-1', name: 'Scholarships' }]),
}))

function renderForm() {
  const onSubmit = vi.fn().mockResolvedValue('/applications/new-id')
  renderWithProviders(
    <ApplicationForm
      defaultValues={EMPTY_APPLICATION_FORM_VALUES}
      submitLabel="Save application"
      submittingLabel="Saving…"
      onSubmit={onSubmit}
      onCancel={vi.fn()}
    />,
  )
  return { onSubmit, user: userEvent.setup() }
}

describe('ApplicationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows required-field errors and does not submit an empty form', async () => {
    const { onSubmit, user } = renderForm()

    await user.click(screen.getByRole('button', { name: 'Save application' }))

    expect(await screen.findByText('Enter the opportunity title.')).toBeInTheDocument()
    expect(screen.getByText('Enter the organization.')).toBeInTheDocument()
    expect(screen.getByLabelText(/Opportunity title/)).toHaveAttribute('aria-invalid', 'true')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('rejects a submission date on a draft', async () => {
    const { onSubmit, user } = renderForm()

    await user.type(screen.getByLabelText(/Opportunity title/), 'Data Fellowship')
    await user.type(screen.getByLabelText(/Organization or institution/), 'Acme Foundation')
    await user.type(screen.getByLabelText(/Date submitted/), '2026-10-01')
    await user.click(screen.getByRole('button', { name: 'Save application' }))

    expect(await screen.findByText(/A draft has not been submitted yet/)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits valid values', async () => {
    const { onSubmit, user } = renderForm()

    await user.type(screen.getByLabelText(/Opportunity title/), 'Data Fellowship')
    await user.type(screen.getByLabelText(/Organization or institution/), 'Acme Foundation')
    await user.selectOptions(screen.getByLabelText(/^Status/), 'submitted')
    await user.type(screen.getByLabelText(/Date submitted/), '2026-10-01')
    await user.click(screen.getByRole('button', { name: 'Save application' }))

    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      title: 'Data Fellowship',
      organization: 'Acme Foundation',
      status: 'submitted',
      submittedDate: '2026-10-01',
    })
  })
})
