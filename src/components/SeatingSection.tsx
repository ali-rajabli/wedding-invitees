import { useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import type { Invitee, WeddingTable } from '../types/planner'

type SeatingSectionProps = {
  tables: WeddingTable[]
  inviteeMap: Map<string, Invitee>
  unassignedInvitees: Invitee[]
  onAssignMany: (inviteeIds: string[], tableId: string) => void
  onUnassign: (inviteeId: string) => void
}

export function SeatingSection({
  tables,
  inviteeMap,
  unassignedInvitees,
  onAssignMany,
  onUnassign,
}: Readonly<SeatingSectionProps>) {
  const [selectedInviteeIds, setSelectedInviteeIds] = useState<string[]>([])
  const [selectedTableId, setSelectedTableId] = useState('')
  const [inviteeSearchTerm, setInviteeSearchTerm] = useState('')

  const filteredUnassignedInvitees = useMemo(() => {
    const query = inviteeSearchTerm.trim().toLowerCase()
    if (!query) return unassignedInvitees
    return unassignedInvitees.filter((invitee) =>
      invitee.name.toLowerCase().includes(query),
    )
  }, [inviteeSearchTerm, unassignedInvitees])
  const canAssign = Boolean(selectedInviteeIds.length > 0 && selectedTableId)

  const handleInviteeSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const values: string[] = []
    for (const option of event.target.selectedOptions) {
      values.push(option.value)
    }
    setSelectedInviteeIds(values)
  }

  const handleAssignMany = () => {
    onAssignMany(selectedInviteeIds, selectedTableId)
    setSelectedInviteeIds([])
  }

  const toggleInviteeSelection = (inviteeId: string) => {
    if (selectedInviteeIds.includes(inviteeId)) {
      setSelectedInviteeIds(selectedInviteeIds.filter((id) => id !== inviteeId))
      return
    }

    setSelectedInviteeIds([...selectedInviteeIds, inviteeId])
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-stone-200/70 bg-white/90 p-5 shadow-[0_20px_80px_-40px_rgba(30,41,59,0.45)] dark:border-stone-700/70 dark:bg-slate-900/90 dark:shadow-[0_20px_80px_-40px_rgba(15,23,42,0.65)] sm:p-7">
        <h2 className="font-display text-3xl text-stone-900 dark:text-stone-100">Yerləşdirmə</h2>
        <p className="mt-2 font-body text-stone-600 dark:text-stone-400">Dəvətlini seç və masaya yerləşdir.</p>

        <div className="mt-6 space-y-3">
          <div className="rounded-2xl border border-stone-300/40 bg-stone-50/50 p-4 dark:border-stone-600/40 dark:bg-slate-800/30">
              <div className="grid gap-3 md:grid-cols-3">
                <label className="font-body text-sm font-medium text-stone-700 dark:text-stone-300">
                  <span>Dəvətli seçimi</span>
                  <input
                    value={inviteeSearchTerm}
                    onChange={(event) => setInviteeSearchTerm(event.target.value)}
                    placeholder="Dəvətli adında axtar"
                    className="mt-1.5 w-full rounded-xl border border-stone-300/60 bg-white px-4 py-2.5 font-body outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-stone-600/60 dark:bg-slate-900 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-slate-500 dark:focus:ring-slate-700"
                  />
                  <select
                    multiple
                    value={selectedInviteeIds}
                    onChange={handleInviteeSelectChange}
                    className="mt-2 cursor-pointer w-full rounded-xl border border-stone-300/60 bg-white px-4 py-2.5 font-body outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-stone-600/60 dark:bg-slate-900 dark:text-stone-100 dark:focus:border-slate-500 dark:focus:ring-slate-700"
                    size={6}
                  >
                    {filteredUnassignedInvitees.map((invitee) => (
                      <option key={invitee.id} value={invitee.id}>
                        {invitee.name}
                      </option>
                    ))}
                    {filteredUnassignedInvitees.length === 0 && (
                      <option value="" disabled>
                        Nəticə tapılmadı
                      </option>
                    )}
                  </select>
                </label>

                <label className="font-body text-sm font-medium text-stone-700 dark:text-stone-300">
                  <span>Masa seçimi</span>
                  <select
                    value={selectedTableId}
                    onChange={(event) => setSelectedTableId(event.target.value)}
                    className="mt-1.5 cursor-pointer w-full rounded-xl border border-stone-300/60 bg-white px-4 py-2.5 font-body outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-stone-600/60 dark:bg-slate-900 dark:text-stone-100 dark:focus:border-slate-500 dark:focus:ring-slate-700"
                  >
                    <option value="">Masa seçin</option>
                    {tables.map((table) => (
                      <option key={table.id} value={table.id}>
                        {table.name} ({table.inviteeIds.length}/{table.capacity})
                      </option>
                    ))}
                  </select>
                </label>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleAssignMany}
                    disabled={!canAssign}
                    className="cursor-pointer w-full rounded-xl bg-slate-700 px-5 py-2.5 font-body font-semibold text-white transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:bg-slate-300 dark:border-slate-600/50 dark:bg-slate-800 dark:hover:bg-slate-700 dark:disabled:bg-slate-900/50"
                  >
                    Seçilənləri masaya yerləşdir
                  </button>
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-stone-300/40 bg-white px-3 py-2 font-body text-sm text-stone-600 dark:border-stone-600/40 dark:bg-slate-800/40 dark:text-stone-400">
                {selectedInviteeIds.length > 0
                  ? `Seçilən dəvətli sayı: ${selectedInviteeIds.length}`
                  : 'İpucu: Birdən çox dəvətlini seçib bir anda masaya əlavə edə bilərsiniz.'}
              </div>
            </div>
        </div>

        <div className="mt-6 rounded-2xl border border-stone-300/40 bg-stone-50/50 p-4 dark:border-stone-600/40 dark:bg-slate-800/30">
          <h3 className="font-display text-lg text-stone-800 dark:text-stone-200">Boşda olan dəvətlilər</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {unassignedInvitees.length === 0 && (
              <p className="font-body text-sm text-stone-500 dark:text-stone-400">
                Bütün dəvətlilər masalara yerləşdirilib.
              </p>
            )}
            {unassignedInvitees.map((invitee) => (
              <button
                key={invitee.id}
                type="button"
                onClick={() => toggleInviteeSelection(invitee.id)}
                className={`cursor-pointer rounded-full border px-3 py-1 font-body text-sm transition ${
                  selectedInviteeIds.includes(invitee.id)
                    ? 'border-slate-400 bg-slate-100 text-slate-800 dark:border-slate-500 dark:bg-slate-700 dark:text-slate-100'
                    : 'border-stone-300/60 bg-white text-stone-700 hover:border-slate-300 hover:bg-slate-50 dark:border-stone-600/60 dark:bg-slate-800 dark:text-stone-300 dark:hover:border-slate-500 dark:hover:bg-slate-700'
                }`}
              >
                {invitee.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <h3 className="mt-8 font-display text-lg text-stone-800 dark:text-stone-200">Masalar</h3>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {tables.map((table) => (
          <article
            key={table.id}
            className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-700 dark:bg-slate-800 dark:shadow-[0_15px_40px_-30px_rgba(15,23,42,0.65)]"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl text-stone-900 dark:text-stone-100">{table.name}</h3>
              <span className="rounded-full bg-stone-200/60 px-3 py-1 font-body text-sm text-stone-700 dark:bg-slate-700/60 dark:text-stone-300">
                {table.inviteeIds.length}/{table.capacity}
              </span>
            </div>

            <div className="mt-4 space-y-2">
              {table.inviteeIds.length === 0 && (
                <p className="font-body text-sm text-stone-500 dark:text-stone-400">Bu masada hələ heç kim yoxdur.</p>
              )}

              {table.inviteeIds.map((inviteeId) => {
                const invitee = inviteeMap.get(inviteeId)
                if (!invitee) return null

                return (
                  <div
                    key={inviteeId}
                    className="flex items-center justify-between rounded-xl border border-stone-300/40 bg-stone-100/40 px-3 py-2 dark:border-stone-600/40 dark:bg-slate-700/40"
                  >
                    <span className="font-body text-sm font-medium text-stone-800 dark:text-stone-200">
                      {invitee.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUnassign(inviteeId)}
                      className="cursor-pointer rounded-lg border border-red-300/50 bg-red-50/60 px-2.5 py-1 font-body text-xs font-semibold text-red-700 hover:bg-red-100/60 dark:border-red-900/50 dark:bg-red-950/70 dark:text-red-300 dark:hover:bg-red-900/50"
                    >
                      Çıxar
                    </button>
                  </div>
                )
              })}
            </div>
          </article>
        ))}

        {tables.length === 0 && (
          <p className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-4 font-body text-stone-500 dark:border-stone-600 dark:bg-slate-800/40 dark:text-stone-400">
            Yerləşdirmə üçün əvvəlcə masa yaradın.
          </p>
        )}
      </div>
    </section>
  )
}
