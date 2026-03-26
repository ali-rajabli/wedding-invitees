import type { Invitee, PlannerData, WeddingTable } from '../types/planner'
import * as XLSX from 'xlsx'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function downloadPlannerExcel(data: PlannerData) {
  const workbook = XLSX.utils.book_new()

  // Yerləşdirmə map yaradın
  const tableNameByInviteeId = new Map<string, string>()
  data.tables.forEach((table) => {
    table.inviteeIds.forEach((inviteeId) => {
      tableNameByInviteeId.set(inviteeId, table.name)
    })
  })

  // Dəvətlilər sheet - masa adı əlavə
  const inviteeRows = data.invitees.map((invitee) => ({
    ad: invitee.name,
    masa: tableNameByInviteeId.get(invitee.id) || 'Yerləşdirilmədi',
  }))

  // Masalar sheet - dəvətli adlarını əlavə
  const tableRows = data.tables.map((table) => {
    const inviteeNames = table.inviteeIds
      .map((id) => data.invitees.find((i) => i.id === id)?.name || '')
      .filter(Boolean)
      .join('; ')

    return {
      ad: table.name,
      tutum: table.capacity,
      doluluq: `${table.inviteeIds.length}/${table.capacity}`,
      devetliler: inviteeNames || '(Boş)',
    }
  })

  // Yerləşdirmə sheet (seating assignments)
  const seatingRows = data.invitees.map((invitee) => ({
    ad: invitee.name,
    masa: tableNameByInviteeId.get(invitee.id) || 'Yerləşdirilmədi',
  }))

  const inviteesSheet = XLSX.utils.json_to_sheet(inviteeRows)
  const tablesSheet = XLSX.utils.json_to_sheet(tableRows)
  const seatingSheet = XLSX.utils.json_to_sheet(seatingRows)

  XLSX.utils.book_append_sheet(workbook, inviteesSheet, 'Dəvətlilər')
  XLSX.utils.book_append_sheet(workbook, tablesSheet, 'Masalar')
  XLSX.utils.book_append_sheet(workbook, seatingSheet, 'Yerləşdirmə')

  const dateTag = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(workbook, `toy-planlayici-${dateTag}.xlsx`)
}

function toRecordArray(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) return []
  return value.filter(isRecord)
}

function normalizeInviteesFromExcel(rows: Record<string, unknown>[]): Invitee[] {
  return rows
    .map((row, index) => {
      const idValue = typeof row.id === 'string' ? row.id.trim() : ''
      const nameValue = typeof row.ad === 'string' ? row.ad.trim() : ''
      const id = idValue || `excel-invitee-${index + 1}`
      return { id, name: nameValue }
    })
    .filter((item) => item.name)
}

function normalizeTablesFromExcel(
  rows: Record<string, unknown>[],
  inviteeIds: Set<string>,
): WeddingTable[] {
  return rows
    .map((row, index) => {
      const idValue = typeof row.id === 'string' ? row.id.trim() : ''
      const nameValue = typeof row.ad === 'string' ? row.ad.trim() : ''
      const capacityValue = Number(row.tutum)
      const inviteeIdsRaw =
        typeof row.devetliler === 'string' ? row.devetliler : ''

      const parsedInviteeIds = inviteeIdsRaw
        .split(',')
        .map((id) => id.trim())
        .filter((id) => id && inviteeIds.has(id))

      return {
        id: idValue || `excel-table-${index + 1}`,
        name: nameValue,
        capacity: Number.isFinite(capacityValue) ? capacityValue : 0,
        inviteeIds: parsedInviteeIds,
      }
    })
    .filter((table) => table.name && table.capacity > 0)
    .map((table) => ({
      ...table,
      inviteeIds: table.inviteeIds.slice(0, table.capacity),
    }))
}

export function parsePlannerExcel(fileBuffer: ArrayBuffer): PlannerData {
  const workbook = XLSX.read(fileBuffer, { type: 'array' })

  const inviteesSheet =
    workbook.Sheets['Dəvətlilər'] ??
    workbook.Sheets['Devetliler'] ??
    workbook.Sheets[workbook.SheetNames[0] ?? '']
  const tablesSheet =
    workbook.Sheets['Masalar'] ??
    workbook.Sheets[workbook.SheetNames[1] ?? '']
  const seatingSheet =
    workbook.Sheets['Yerləşdirmə'] ??
    workbook.Sheets[workbook.SheetNames[2] ?? '']

  const inviteeRows = inviteesSheet
    ? toRecordArray(
        XLSX.utils.sheet_to_json(inviteesSheet, {
          defval: '',
        }),
      )
    : []

  const invitees = normalizeInviteesFromExcel(inviteeRows)
  const inviteeIdSet = new Set(invitees.map((item) => item.id))

  const tableRows = tablesSheet
    ? toRecordArray(
        XLSX.utils.sheet_to_json(tablesSheet, {
          defval: '',
        }),
      )
    : []

  const tables = normalizeTablesFromExcel(tableRows, inviteeIdSet)

  // Yerləşdirmə sheet-dən data oxuyub table-lara əvə et
  if (seatingSheet) {
    const seatingRows = toRecordArray(
      XLSX.utils.sheet_to_json(seatingSheet, {
        defval: '',
      }),
    )

    seatingRows.forEach((row) => {
      const inviteeName = typeof row.ad === 'string' ? row.ad.trim() : ''
      const tableName = typeof row.masa === 'string' ? row.masa.trim() : ''

      if (inviteeName && tableName && tableName !== 'Yerləşdirilmədi') {
        const invitee = invitees.find((i) => i.name === inviteeName)
        const table = tables.find((t) => t.name === tableName)

        if (invitee && table && !table.inviteeIds.includes(invitee.id)) {
          if (table.inviteeIds.length < table.capacity) {
            table.inviteeIds.push(invitee.id)
          }
        }
      }
    })
  }

  return { invitees, tables }
}
