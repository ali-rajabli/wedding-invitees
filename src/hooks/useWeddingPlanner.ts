import { useEffect, useMemo, useState } from 'react'
import { STORAGE_KEYS } from '../constants/storage'
import type { Invitee, PlannerData, WeddingTable } from '../types/planner'
import { createId } from '../utils/id'
import { parsePlannerExcel } from '../utils/importExport'
import { readStorage, writeStorage } from '../utils/localStorage'

function removeInviteeFromAllTables(
  tables: WeddingTable[],
  inviteeId: string,
): WeddingTable[] {
  return tables.map((table) => ({
    ...table,
    inviteeIds: table.inviteeIds.filter((id) => id !== inviteeId),
  }))
}

function placeInviteeOnTable(
  tables: WeddingTable[],
  inviteeId: string,
  tableId: string,
): WeddingTable[] {
  return removeInviteeFromAllTables(tables, inviteeId).map((table) => {
    if (table.id !== tableId) return table
    return {
      ...table,
      inviteeIds: [...table.inviteeIds, inviteeId],
    }
  })
}

function assignManyInviteesOnTable(
  tables: WeddingTable[],
  tableId: string,
  inviteeIds: string[],
): { nextTables: WeddingTable[]; assignedCount: number; remainingCount: number } {
  const inviteeIdSet = new Set(inviteeIds)
  const nextTables = tables.map((table) => ({
    ...table,
    inviteeIds: table.inviteeIds.filter((id) => !inviteeIdSet.has(id)),
  }))

  const tableIndex = nextTables.findIndex((table) => table.id === tableId)
  if (tableIndex < 0) {
    return {
      nextTables: tables,
      assignedCount: 0,
      remainingCount: inviteeIds.length,
    }
  }

  const targetTable = nextTables[tableIndex]
  const availableSlots = Math.max(0, targetTable.capacity - targetTable.inviteeIds.length)
  const acceptedInviteeIds = inviteeIds.slice(0, availableSlots)

  nextTables[tableIndex] = {
    ...targetTable,
    inviteeIds: [...targetTable.inviteeIds, ...acceptedInviteeIds],
  }

  return {
    nextTables,
    assignedCount: acceptedInviteeIds.length,
    remainingCount: Math.max(0, inviteeIds.length - acceptedInviteeIds.length),
  }
}

export function useWeddingPlanner() {
  const [invitees, setInvitees] = useState<Invitee[]>(() =>
    readStorage<Invitee[]>(STORAGE_KEYS.invitees, []),
  )
  const [tables, setTables] = useState<WeddingTable[]>(() =>
    readStorage<WeddingTable[]>(STORAGE_KEYS.tables, []),
  )

  const [notice, setNotice] = useState('')

  useEffect(() => {
    writeStorage(STORAGE_KEYS.invitees, invitees)
  }, [invitees])

  useEffect(() => {
    writeStorage(STORAGE_KEYS.tables, tables)
  }, [tables])

  const inviteeMap = useMemo(
    () => new Map(invitees.map((invitee) => [invitee.id, invitee])),
    [invitees],
  )

  const inviteeTableMap = useMemo(() => {
    const map = new Map<string, string>()
    tables.forEach((table) => {
      table.inviteeIds.forEach((inviteeId) => {
        map.set(inviteeId, table.id)
      })
    })
    return map
  }, [tables])

  const unassignedInvitees = useMemo(
    () => invitees.filter((invitee) => !inviteeTableMap.has(invitee.id)),
    [invitees, inviteeTableMap],
  )

  const stats = useMemo(() => {
    const totalInvitees = invitees.length
    const assignedInvitees = tables.reduce((sum, table) => sum + table.inviteeIds.length, 0)
    const unassignedCount = Math.max(0, totalInvitees - assignedInvitees)
    const totalCapacity = tables.reduce((sum, table) => sum + table.capacity, 0)
    const occupancyPercent = totalCapacity > 0 ? Math.round((assignedInvitees / totalCapacity) * 100) : 0

    return {
      totalInvitees,
      assignedInvitees,
      unassignedCount,
      totalTables: tables.length,
      totalCapacity,
      occupancyPercent,
    }
  }, [invitees, tables])

  const addInvitee = (nameInput: string) => {
    const name = nameInput.trim()
    if (!name) return

    setInvitees((prev) => [...prev, { id: createId(), name }])
    setNotice('Dəvətli əlavə edildi.')
  }

  const renameInvitee = (inviteeId: string, nameInput: string) => {
    const name = nameInput.trim()
    if (!name) return

    setInvitees((prev) =>
      prev.map((invitee) =>
        invitee.id === inviteeId ? { ...invitee, name } : invitee,
      ),
    )
    setNotice('Dəvətlinin adı yeniləndi.')
  }

  const removeInvitee = (inviteeId: string) => {
    setInvitees((prev) => prev.filter((invitee) => invitee.id !== inviteeId))
    setTables((prev) => removeInviteeFromAllTables(prev, inviteeId))
    setNotice('Dəvətli silindi.')
  }

  const addTable = (nameInput: string, capacityInput: string) => {
    const name = nameInput.trim()
    const capacity = Number(capacityInput)
    if (!name || Number.isNaN(capacity) || capacity < 1) return

    setTables((prev) => [
      ...prev,
      { id: createId(), name, capacity, inviteeIds: [] },
    ])
    setNotice('Masa əlavə edildi.')
  }

  const editTable = (tableId: string, nameInput: string, capacityInput: string) => {
    const name = nameInput.trim()
    const capacity = Number(capacityInput)
    if (!name || Number.isNaN(capacity) || capacity < 1) return

    setTables((prev) =>
      prev.map((table) => {
        if (table.id !== tableId) return table
        return {
          ...table,
          name,
          capacity,
          inviteeIds: table.inviteeIds.slice(0, capacity),
        }
      }),
    )
    setNotice('Masa məlumatları yeniləndi.')
  }

  const removeTable = (tableId: string) => {
    setTables((prev) => prev.filter((table) => table.id !== tableId))
    setNotice('Masa silindi.')
  }

  const assignInviteeToTable = (inviteeId: string, tableId: string) => {
    if (!inviteeId || !tableId) return

    const targetTable = tables.find((table) => table.id === tableId)
    if (!targetTable) return

    const currentTableId = inviteeTableMap.get(inviteeId)
    if (currentTableId === tableId) {
      setNotice('Dəvətli artıq bu masadadır.')
      return
    }

    if (targetTable.inviteeIds.length >= targetTable.capacity) {
      setNotice('Bu masa doludur, başqa masa seçin.')
      return
    }

    setTables((prev) => placeInviteeOnTable(prev, inviteeId, tableId))

    setNotice('Dəvətli masaya yerləşdirildi.')
  }

  const assignInviteesToTable = (inviteeIdsInput: string[], tableId: string) => {
    if (!tableId) return

    const inviteeIds = [...new Set(inviteeIdsInput.filter(Boolean))]
    if (inviteeIds.length === 0) return

    const targetTable = tables.find((table) => table.id === tableId)
    if (!targetTable) return

    let assignedCount = 0
    let remainingCount = 0

    setTables((prev) => {
      const result = assignManyInviteesOnTable(prev, tableId, inviteeIds)
      assignedCount = result.assignedCount
      remainingCount = result.remainingCount
      return result.nextTables
    })

    if (assignedCount === 0) {
      setNotice('Bu masada boş yer yoxdur.')
      return
    }

    if (remainingCount > 0) {
      setNotice(`${assignedCount} dəvətli yerləşdirildi, ${remainingCount} nəfər üçün yer çatmadı.`)
      return
    }

    setNotice(`${assignedCount} dəvətli masaya yerləşdirildi.`)
  }

  const unassignInvitee = (inviteeId: string) => {
    setTables((prev) => removeInviteeFromAllTables(prev, inviteeId))
    setNotice('Dəvətli masadan çıxarıldı.')
  }

  const importFromExcel = (fileBuffer: ArrayBuffer) => {
    const nextData = parsePlannerExcel(fileBuffer)
    setInvitees(nextData.invitees)
    setTables(nextData.tables)
    setNotice('Excel uğurla idxal olundu.')
  }

  const getExportData = (): PlannerData => ({ invitees, tables })

  return {
    invitees,
    tables,
    notice,
    setNotice,
    inviteeMap,
    inviteeTableMap,
    unassignedInvitees,
    stats,
    addInvitee,
    renameInvitee,
    removeInvitee,
    addTable,
    editTable,
    removeTable,
    assignInviteeToTable,
    assignInviteesToTable,
    unassignInvitee,
    importFromExcel,
    getExportData,
  }
}
