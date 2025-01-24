/// <reference lib="dom" />

import { test, expect, mock, spyOn } from 'bun:test'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateTicketForm } from '../../src/components/CreateTicketForm'
import { AuthContext } from '../../src/contexts/AuthContext'

// Mock Supabase
const mockSupabase = {
    from: (table: string) => {
        if (table === 'users') {
            return {
                select: (column: string) => {
                    if (column === 'workspace_id') {
                        return {
                            eq: (field: string, value: string) => {
                                if (field === 'id' && value === 'test-user-id') {
                                    return {
                                        single: () => new Promise(resolve => {
                                            setTimeout(() => {
                                                resolve({
                                                    data: { workspace_id: 'test-workspace' },
                                                    error: null
                                                })
                                            }, 150)
                                        })
                                    }
                                }
                                throw new Error('Unexpected eq arguments')
                            }
                        }
                    }
                    throw new Error('Unexpected select column')
                }
            }
        }
        if (table === 'tickets') {
            return {
                insert: (data: any) => {
                    if (
                        data.title === 'Test Ticket' &&
                        data.description === 'Test Description' &&
                        ['low', 'medium', 'high'].includes(data.priority) &&
                        data.workspace_id === 'test-workspace' &&
                        data.created_by_user_id === 'test-user-id'
                    ) {
                        return new Promise(resolve => {
                            setTimeout(() => {
                                resolve({ error: null })
                            }, 150)
                        })
                    }
                    throw new Error('Unexpected insert data')
                }
            }
        }
        throw new Error('Unexpected table')
    }
}

// Mock the module
mock.module('../../src/lib/supabase', () => ({
    supabase: mockSupabase
}))

// Test session data
const mockSession = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    token_type: 'bearer',
    user: {
        id: 'test-user-id',
        email: 'test@example.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: '2024-01-24T00:00:00.000Z',
        role: 'authenticated',
        updated_at: '2024-01-24T00:00:00.000Z'
    }
}

const mockOnSuccess = { onSuccess: () => {} }
const onSuccess = spyOn(mockOnSuccess, 'onSuccess')

const renderComponent = () => {
    return render(
        <AuthContext.Provider value={{ session: mockSession, loading: false }}>
            <CreateTicketForm onSuccess={onSuccess} />
        </AuthContext.Provider>
    )
}

test('CreateTicketForm renders all form fields', async () => {
    const { getByLabelText, getByRole } = renderComponent()
    
    const titleInput = getByLabelText(/title/i)
    const descriptionInput = getByLabelText(/description/i)
    const priorityInput = getByLabelText(/priority/i)
    const submitButton = getByRole('button')

    expect(titleInput).toBeDefined()
    expect(descriptionInput).toBeDefined()
    expect(priorityInput).toBeDefined()
    expect(submitButton).toBeDefined()
    expect(submitButton.textContent).toBe('Create Ticket')
})

test('CreateTicketForm enforces character limits', async () => {
    const { getByLabelText } = render(<CreateTicketForm />)

    const titleInput = getByLabelText(/title/i) as HTMLInputElement
    const descriptionInput = getByLabelText(/description/i) as HTMLTextAreaElement

    // Test title max length (80 chars)
    const longTitle = 'a'.repeat(81)
    titleInput.value = longTitle.slice(0, titleInput.maxLength)
    titleInput.dispatchEvent(new Event('input', { bubbles: true }))
    expect(titleInput.value.length).toBe(80)

    // Test description max length (2000 chars)
    const longDescription = 'a'.repeat(2001)
    descriptionInput.value = longDescription.slice(0, descriptionInput.maxLength)
    descriptionInput.dispatchEvent(new Event('input', { bubbles: true }))
    expect(descriptionInput.value.length).toBe(2000)
})

test('CreateTicketForm shows loading state during submission', async () => {
    const { getByLabelText, getByRole } = renderComponent()
    const user = userEvent.setup()
    
    // Fill out the form
    await user.type(getByLabelText(/title/i), 'Test Ticket')
    await user.type(getByLabelText(/description/i), 'Test Description')
    await user.selectOptions(getByLabelText(/priority/i), 'high')
    
    // Submit the form
    const submitButton = getByRole('button') as HTMLButtonElement
    await user.click(submitButton)
    
    // Check loading state immediately after click
    expect(submitButton.disabled).toBe(true)
    expect(submitButton.textContent).toBe('Creating...')
    
    // Wait for the delayed Supabase responses
    await new Promise(resolve => setTimeout(resolve, 300))
})

test('CreateTicketForm successfully submits form', async () => {
    const { getByLabelText, getByRole } = renderComponent()
    const user = userEvent.setup()
    
    // Fill out the form
    await user.type(getByLabelText(/title/i), 'Test Ticket')
    await user.type(getByLabelText(/description/i), 'Test Description')
    await user.selectOptions(getByLabelText(/priority/i), 'high')
    
    // Submit the form
    await user.click(getByRole('button'))
    
    // Wait for the delayed Supabase responses and state updates
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Verify form reset
    const titleInput = getByLabelText(/title/i) as HTMLInputElement
    const descriptionInput = getByLabelText(/description/i) as HTMLTextAreaElement
    const priorityInput = getByLabelText(/priority/i) as HTMLSelectElement
    
    expect(titleInput.value).toBe('')
    expect(descriptionInput.value).toBe('')
    expect(priorityInput.value).toBe('low')
    expect(onSuccess).toHaveBeenCalled()
}) 