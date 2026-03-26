export type Invitee = {
  id: string
  name: string
}

export type WeddingTable = {
  id: string
  name: string
  capacity: number
  inviteeIds: string[]
}

export type Section = 'invitees' | 'tables' | 'seating'

export type PlannerData = {
  invitees: Invitee[]
  tables: WeddingTable[]
}

export type InviteeFilter = 'all' | 'assigned' | 'unassigned'

export type TableFilter = 'all' | 'available' | 'full'
