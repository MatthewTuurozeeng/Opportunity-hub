// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthContext } from '@/features/auth/context/authContext'
import { renderWithProviders } from '@/test/renderWithProviders'

import { uploadDocument } from '../services/document.service'
import { UploadDocumentDialog } from './UploadDocumentDialog'

vi.mock('../services/document.service', () => ({
  uploadDocument: vi.fn(),
}))

const uploadDocumentMock = vi.mocked(uploadDocument)

function renderDialog() {
  renderWithProviders(
    <AuthContext.Provider value={{ session: null, user: { id: 'user-1' } as never, isLoading: false }}>
      <UploadDocumentDialog isOpen onOpenChange={vi.fn()} />
    </AuthContext.Provider>,
  )
  // Let the test pick files the browser's `accept` filter would hide, to prove validation catches them.
  return userEvent.setup({ applyAccept: false })
}

function getFileInput(): HTMLInputElement {
  const input = document.querySelector<HTMLInputElement>('input[type="file"]')
  if (!input) throw new Error('File input not found')
  return input
}

describe('UploadDocumentDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects unsupported file types before uploading', async () => {
    const user = renderDialog()

    await user.upload(getFileInput(), new File(['MZ'], 'setup.exe', { type: 'application/x-msdownload' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('This file type is not supported')
    await user.click(screen.getByRole('button', { name: /Upload/ }))
    expect(uploadDocumentMock).not.toHaveBeenCalled()
  })

  it('rejects files over the size limit', async () => {
    const user = renderDialog()
    const largeFile = new File(['x'], 'huge.pdf', { type: 'application/pdf' })
    Object.defineProperty(largeFile, 'size', { value: 11 * 1024 * 1024 })

    await user.upload(getFileInput(), largeFile)

    expect(await screen.findByRole('alert')).toHaveTextContent('This file is too large')
  })

  it('uploads a valid file, naming it after the file by default', async () => {
    uploadDocumentMock.mockResolvedValue({} as never)
    const user = renderDialog()

    await user.upload(getFileInput(), new File(['%PDF'], 'My CV.pdf', { type: 'application/pdf' }))
    expect(screen.getByLabelText(/^Name/)).toHaveValue('My CV')
    await user.click(screen.getByRole('button', { name: /Upload/ }))

    await vi.waitFor(() => expect(uploadDocumentMock).toHaveBeenCalledTimes(1))
    expect(uploadDocumentMock.mock.calls[0][0]).toMatchObject({ userId: 'user-1', name: 'My CV' })
  })
})
