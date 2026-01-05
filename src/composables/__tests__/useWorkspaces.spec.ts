import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useWorkspaces } from '../useWorkspaces'

// Mock firebase/auth
const mockUser = { uid: 'test-user-id' }
vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({
    user: { value: mockUser }
  })
}))

// Mock firebase/firestore
const mockAddDoc = vi.fn().mockResolvedValue({ id: 'new-workspace-id' })
const mockDeleteDoc = vi.fn()
const mockOnSnapshot = vi.fn((q, callback) => {
  callback({
    docs: [
      { id: '1', data: () => ({ name: 'Workspace 1', userId: 'test-user-id' }) }
    ]
  })
  return () => {}
})

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: (...args: unknown[]) => mockAddDoc(...args),
  deleteDoc: (...args: unknown[]) => mockDeleteDoc(...args),
  doc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  // @ts-expect-error - spread unknown[] into mock
  onSnapshot: (...args: unknown[]) => mockOnSnapshot(...args),
  serverTimestamp: vi.fn(),
  updateDoc: vi.fn(),
  getDocs: vi.fn().mockResolvedValue({
    docs: [
      { ref: 'item-ref-1' },
      { ref: 'item-ref-2' }
    ],
    size: 2
  })
}))

vi.mock('@/firebase/config', () => ({
  db: {}
}))

describe('useWorkspaces', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with workspaces', async () => {
    const { workspaces } = useWorkspaces()
    // Wait for effect? In setup, it runs synchronously or microtask.
    // Since we mock onSnapshot to call back immediately:
    expect(workspaces.value).toHaveLength(1)
    expect(workspaces.value[0]?.name).toBe('Workspace 1')
  })

  it('creates a workspace', async () => {
    const { createWorkspace } = useWorkspaces()
    const id = await createWorkspace('New Workspace')
    expect(mockAddDoc).toHaveBeenCalled()
    expect(id).toBe('new-workspace-id')
  })

  it('deletes a workspace', async () => {

    const { deleteWorkspace } = useWorkspaces()
    await deleteWorkspace('1')
    expect(mockDeleteDoc).toHaveBeenCalled()
  })
})
