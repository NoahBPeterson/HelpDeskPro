/// <reference lib="dom" />

import { test, expect, mock } from 'bun:test'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ViewTicket } from '../../src/components/ViewTicket'
import { AuthContext } from '../../src/contexts/AuthContext'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

// Mock the useUser hook
mock.module('../../src/contexts/AuthContext', () => ({
    AuthContext: {
        Provider: ({ children }: any) => children
    },
    useAuth: () => ({ 
        session: createMockSession('agent'), 
        loading: false,
        workspace_id: 'test-workspace'
    }),
    useUser: () => ({ 
        user: createMockSession('agent').user, 
        role: 'agent', 
        isLoading: false,
        workspace_id: 'test-workspace'
    })
}))

// Mock ticket data
const mockTicket = {
    id: 'test-ticket-id',
    title: 'Test Ticket',
    description: 'Test Description',
    status: 'new',
    priority: 'low',
    created_by_user_id: 'test-user-id',
    assigned_to_user_id: null,
    team_id: null,
    workspace_id: 'test-workspace',
    created_at: '2024-01-24T00:00:00.000Z',
    updated_at: '2024-01-24T00:00:00.000Z',
    creator: {
        email: 'test@example.com'
    }
}

// Mock agents data
const mockAgents = [
    { id: 'agent-1', email: 'agent1@example.com', role: 'agent' },
    { id: 'agent-2', email: 'agent2@example.com', role: 'agent' }
]

// Mock teams data
const mockTeams = [
    { id: 'team-1', name: 'Team 1' },
    { id: 'team-2', name: 'Team 2' }
]

// Mock comments data
const mockComments = [
    {
        id: 'comment-1',
        ticket_id: 'test-ticket-id',
        content: 'Test comment',
        type: 'reply',
        created_at: '2024-01-24T00:00:00.000Z',
        user: { email: 'test@example.com' }
    }
]

// Mock Supabase
const mockSupabase = {
    from: (table: string) => {
        let conditions: { field: string; value: any; operator?: string }[] = [];
        let selectedColumns = '*';
        let orderConfig: { column: string; ascending: boolean } | null = null;
        
        const query = {
            select: (columns: string = '*') => {
                selectedColumns = columns;
                return query;
            },
            eq: (field: string, value: any) => {
                conditions.push({ field, value });
                return query;
            },
            neq: (field: string, value: any) => {
                conditions.push({ field, value, operator: 'neq' });
                return query;
            },
            order: (column: string, { ascending = true } = {}) => {
                orderConfig = { column, ascending };
                return query;
            },
            single: () => {
                if (table === 'users' && selectedColumns === 'workspace_id') {
                    return Promise.resolve({ data: { workspace_id: 'test-workspace' }, error: null });
                }
                if (table === 'tickets') {
                    return Promise.resolve({
                        data: mockTicket,
                        error: null
                    });
                }
                return Promise.resolve({ data: null, error: null });
            },
            then: (callback: (result: any) => void) => {
                /*console.log('🔍 [Mock Supabase] then called with:', {
                    table,
                    conditions,
                    selectedColumns,
                    orderConfig
                });*/
                
                let result;
                if (table === 'users' && conditions.some(c => c.operator === 'neq' && c.field === 'role' && c.value === 'end_user')) {
                    result = { data: mockAgents, error: null };
                } else if (table === 'teams') {
                    result = { data: mockTeams, error: null };
                } else if (table === 'comments') {
                    const sortedComments = [...mockComments];
                    if (orderConfig && orderConfig.column === 'created_at') {
                        sortedComments.sort((a, b) => {
                            const aTime = new Date(a.created_at).getTime();
                            const bTime = new Date(b.created_at).getTime();
                            return orderConfig!.ascending ? aTime - bTime : bTime - aTime;
                        });
                    }
                    result = { data: sortedComments, error: null };
                } else {
                    result = { data: [], error: null };
                }
                
                return Promise.resolve(result).then(callback);
            },
            update: (data: any) => {
                return {
                    eq: (field: string, value: string) => {
                        if (table === 'tickets' && field === 'id' && value === mockTicket.id) {
                            Object.assign(mockTicket, data);
                            return Promise.resolve({ data: mockTicket, error: null });
                        }
                        return Promise.resolve({ data: null, error: null });
                    }
                };
            },
            insert: (data: any) => {
                if (table === 'comments') {
                    mockComments.push({
                        id: `comment-${mockComments.length + 1}`,
                        ticket_id: data.ticket_id,
                        content: data.content,
                        type: data.type || 'reply',
                        created_at: new Date().toISOString(),
                        user: { email: 'test@example.com' }
                    });
                }
                return Promise.resolve({ error: null });
            }
        };
        
        return query;
    }
};

// Mock the module
mock.module('../../src/lib/supabase', () => ({
    supabase: mockSupabase
}))

// Test session data for different roles
const createMockSession = (role: 'admin' | 'agent' | 'end_user') => {
    return {
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
            role: role,
            updated_at: '2024-01-24T00:00:00.000Z',
            workspace_id: 'test-workspace'
        }
    }
}

const renderComponent = (role: 'admin' | 'agent' | 'end_user' = 'agent') => {
    const session = createMockSession(role)
    
    return render(
        <AuthContext.Provider value={{ session, loading: false }}>
            <MemoryRouter initialEntries={['/ticket/test-ticket-id']}>
                <Routes>
                    <Route path="/ticket/:id" element={<ViewTicket />} />
                </Routes>
            </MemoryRouter>
        </AuthContext.Provider>
    )
}

/*
test('Agents can see and use assignment controls', async () => {
    console.log('🧪 [Test] Starting test: Agents can see and use assignment controls');
    const { getByLabelText } = renderComponent('agent')
    
    await waitFor(() => {
        expect(getByLabelText(/assigned to/i)).toBeDefined()
        expect(getByLabelText(/team/i)).toBeDefined()
    }, { timeout: 2000 })
})
*/

test('End users cannot see assignment controls', async () => {
    const { queryByLabelText } = renderComponent('end_user')
    
    await waitFor(() => {
        expect(queryByLabelText(/assigned to/i)).toBeNull()
        expect(queryByLabelText(/team/i)).toBeNull()
    }, { timeout: 2000 })
})

test('Agents can change ticket status', async () => {
    const { getByLabelText } = renderComponent('agent')
    const user = userEvent.setup()
    
    await waitFor(() => {
        expect(getByLabelText('Status')).toBeDefined()
    }, { timeout: 2000 })
    
    // Change status
    const statusSelect = getByLabelText('Status')
    await user.selectOptions(statusSelect, 'open')
    
    await waitFor(() => {
        expect((statusSelect as HTMLSelectElement).value).toBe('open')
    }, { timeout: 2000 })
})

test('Agents can add comments and internal notes', async () => {
    const { getByPlaceholderText, getByLabelText, getByText } = renderComponent('agent')
    const user = userEvent.setup()
    
    await waitFor(() => {
        expect(getByPlaceholderText(/add a comment/i)).toBeDefined()
        expect(getByLabelText(/internal note/i)).toBeDefined()
    }, { timeout: 2000 })
    
    // Add a comment
    const commentInput = getByPlaceholderText(/add a comment/i)
    await user.type(commentInput, 'New test comment')
    
    // Toggle internal note
    const internalNoteCheckbox = getByLabelText(/internal note/i)
    await user.click(internalNoteCheckbox)
    
    // Submit comment
    const submitButton = getByText(/add note/i)
    await user.click(submitButton)
    
    await waitFor(() => {
        expect((commentInput as HTMLTextAreaElement).value).toBe('')
    }, { timeout: 2000 })
})

test('End users can only add regular comments', async () => {
    const { getByPlaceholderText, getByText } = renderComponent('end_user')
    const user = userEvent.setup()
    
    await waitFor(() => {
        expect(getByPlaceholderText(/add a comment/i)).toBeDefined()
    }, { timeout: 2000 })
    
    // Add a comment
    const commentInput = getByPlaceholderText(/add a comment/i)
    await user.type(commentInput, 'New test comment')
    
    // Submit comment
    const submitButton = getByText(/send/i)
    await user.click(submitButton)
    
    await waitFor(() => {
        expect((commentInput as HTMLTextAreaElement).value).toBe('')
    }, { timeout: 2000 })
}) 