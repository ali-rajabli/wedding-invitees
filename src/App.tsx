import { useMemo, useRef, useState } from 'react'
import type { ChangeEventHandler } from 'react'
import { InviteesSection } from './components/InviteesSection'
import { PlannerHeader } from './components/PlannerHeader'
import { SeatingSection } from './components/SeatingSection'
import { TablesSection } from './components/TablesSection'
import { useWeddingPlanner } from './hooks/useWeddingPlanner'
import type { Section } from './types/planner'
import { downloadPlannerExcel } from './utils/importExport'

function App() {
  const [section, setSection] = useState<Section>('invitees')
  const excelInputRef = useRef<HTMLInputElement>(null)

  const {
    invitees,
    tables,
    notice,
    setNotice,
    inviteeMap,
    unassignedInvitees,
    stats,
    addInvitee,
    renameInvitee,
    removeInvitee,
    addTable,
    editTable,
    removeTable,
    assignInviteesToTable,
    unassignInvitee,
    importFromExcel,
    getExportData,
  } = useWeddingPlanner()

  const tableNameByInviteeId = useMemo(() => {
    const map = new Map<string, string>()
    tables.forEach((table) => {
      table.inviteeIds.forEach((inviteeId) => {
        map.set(inviteeId, table.name)
      })
    })
    return map
  }, [tables])

  const handleExcelExport = () => {
    downloadPlannerExcel(getExportData())
    setNotice('Excel ixracı hazırdır.')
  }

  const handleExcelImportFile: ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    void file
      .arrayBuffer()
      .then((buffer) => {
        importFromExcel(buffer)
      })
      .catch(() => {
        setNotice('Excel idxalı zamanı xəta baş verdi.')
      })
      .finally(() => {
        event.target.value = ''
      })
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#fef3f2_0%,_#fffaf5_35%,_#f6f8f3_100%)] text-stone-800">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
        <PlannerHeader
          section={section}
          onSectionChange={setSection}
          inviteeCount={invitees.length}
          tableCount={tables.length}
          assignedCount={stats.assignedInvitees}
          notice={notice}
          onExcelExport={handleExcelExport}
          onExcelImportClick={() => excelInputRef.current?.click()}
        />

        <input
          ref={excelInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleExcelImportFile}
          className="hidden"
        />

        {section === 'invitees' && (
          <InviteesSection
            invitees={invitees}
            tableNameByInviteeId={tableNameByInviteeId}
            onAddInvitee={addInvitee}
            onRenameInvitee={renameInvitee}
            onRemoveInvitee={removeInvitee}
          />
        )}

        {section === 'tables' && (
          <TablesSection
            tables={tables}
            onAddTable={addTable}
            onEditTable={editTable}
            onRemoveTable={removeTable}
          />
        )}

        {section === 'seating' && (
          <SeatingSection
            tables={tables}
            inviteeMap={inviteeMap}
            unassignedInvitees={unassignedInvitees}
            onAssignMany={assignInviteesToTable}
            onUnassign={unassignInvitee}
          />
        )}
      </div>
    </div>
  )
}

export default App
