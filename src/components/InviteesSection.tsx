import { useMemo, useState } from 'react'
import type { Invitee, InviteeFilter } from '../types/planner'

type InviteesSectionProps = {
  invitees: Invitee[]
  tableNameByInviteeId: Map<string, string>
  onAddInvitee: (name: string) => void
  onRenameInvitee: (id: string, name: string) => void
  onRemoveInvitee: (id: string) => void
}

export function InviteesSection({
  invitees,
  tableNameByInviteeId,
  onAddInvitee,
  onRenameInvitee,
  onRemoveInvitee,
}: Readonly<InviteesSectionProps>) {
  const [inviteeName, setInviteeName] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<InviteeFilter>('all')
  const [editingInviteeId, setEditingInviteeId] = useState<string | null>(null)
  const [editingInviteeName, setEditingInviteeName] = useState('')

  const filteredInvitees = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return invitees.filter((invitee) => {
      const isAssigned = tableNameByInviteeId.has(invitee.id)
      const matchesFilter =
        filter === 'all' ||
        (filter === 'assigned' && isAssigned) ||
        (filter === 'unassigned' && !isAssigned)
      const matchesQuery = !query || invitee.name.toLowerCase().includes(query)

      return matchesFilter && matchesQuery
    })
  }, [invitees, filter, searchTerm, tableNameByInviteeId])

  const assignedCount = invitees.filter((invitee) => tableNameByInviteeId.has(invitee.id)).length
  const unassignedCount = invitees.length - assignedCount

  return (
    <section className="rounded-3xl border border-stone-200/70 bg-white/90 p-5 shadow-[0_20px_80px_-40px_rgba(30,41,59,0.45)] dark:border-stone-700/70 dark:bg-slate-900/90 dark:shadow-[0_20px_80px_-40px_rgba(15,23,42,0.65)] sm:p-7">
      <h2 className="font-display text-3xl text-stone-900 dark:text-stone-100">Dəvətlilər</h2>
      <p className="mt-2 font-body text-stone-600 dark:text-stone-400">Yalnız ad daxil etmək kifayətdir.</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-stone-300/40 bg-stone-100/60 px-4 py-3 dark:border-stone-600/40 dark:bg-slate-800/40">
          <p className="font-body text-xs uppercase tracking-[0.14em] text-stone-600 dark:text-stone-400">Ümumi</p>
          <p className="font-display text-3xl text-stone-900 dark:text-stone-100">{invitees.length}</p>
        </div>
        <div className="rounded-xl border border-stone-300/40 bg-stone-100/60 px-4 py-3 dark:border-stone-600/40 dark:bg-slate-800/40">
          <p className="font-body text-xs uppercase tracking-[0.14em] text-stone-600 dark:text-stone-400">Yerləşdirilən</p>
          <p className="font-display text-3xl text-stone-900 dark:text-stone-100">{assignedCount}</p>
        </div>
        <div className="rounded-xl border border-stone-300/40 bg-stone-100/60 px-4 py-3 dark:border-stone-600/40 dark:bg-slate-800/40">
          <p className="font-body text-xs uppercase tracking-[0.14em] text-stone-600 dark:text-stone-400">Boşda qalan</p>
          <p className="font-display text-3xl text-stone-900 dark:text-stone-100">{unassignedCount}</p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            onAddInvitee(inviteeName)
            setInviteeName('')
          }}
          className="rounded-2xl border border-stone-300/40 bg-stone-50/50 p-4 dark:border-stone-600/40 dark:bg-slate-800/30"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <label className="flex-1 font-body text-sm font-medium text-stone-700 dark:text-stone-300">
              <span>Dəvətli adı</span>
              <input
                value={inviteeName}
                onChange={(event) => setInviteeName(event.target.value)}
                placeholder="Məsələn: Aysel Məmmədova"
                className="mt-1.5 w-full rounded-xl border border-stone-300/60 bg-white px-4 py-2.5 font-body outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-stone-600/60 dark:bg-slate-900 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-slate-500 dark:focus:ring-slate-700"
              />
            </label>
            <button
              type="submit"
              className="cursor-pointer rounded-xl bg-slate-700 px-5 py-2.5 font-body font-semibold text-white transition hover:bg-slate-600 dark:border-slate-600/50 dark:bg-slate-800 dark:hover:bg-slate-700"
            >
              + Əlavə et
            </button>
          </div>
        </form>
      </div>

      <div className="mt-4 space-y-3">
        <div className="grid gap-3 rounded-2xl border border-stone-300/40 bg-stone-50/50 p-4 sm:grid-cols-3 dark:border-stone-600/40 dark:bg-slate-800/30">
          <label className="font-body text-sm font-medium text-stone-700 sm:col-span-2 dark:text-stone-300">
            <span>Axtarış</span>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Ada görə axtar"
              className="mt-1.5 w-full rounded-xl border border-stone-300/60 bg-white px-4 py-2.5 font-body outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-stone-600/60 dark:bg-slate-900 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-slate-500 dark:focus:ring-slate-700"
            />
          </label>
          <label className="font-body text-sm font-medium text-stone-700 dark:text-stone-300">
            <span>Filter</span>
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value as InviteeFilter)}
              className="mt-1.5 cursor-pointer w-full rounded-xl border border-stone-300/60 bg-white px-4 py-2.5 font-body outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-stone-600/60 dark:bg-slate-900 dark:text-stone-100 dark:focus:border-slate-500 dark:focus:ring-slate-700"
            >
              <option value="all">Bütün dəvətlilər</option>
              <option value="assigned">Yerləşdirilənlər</option>
              <option value="unassigned">Yerləşdirilməyənlər</option>
            </select>
          </label>
        </div>
      </div>

      <h3 className="mt-6 font-display text-lg text-stone-800 dark:text-stone-200">Dəvətlilər Siyahısı</h3>

      <div className="mt-4 space-y-3">
        {filteredInvitees.length === 0 && (
          <p className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-4 font-body text-stone-500 dark:border-stone-600 dark:bg-slate-800/40 dark:text-stone-400">
            Filterə uyğun dəvətli tapılmadı.
          </p>
        )}

        {filteredInvitees.map((invitee) => {
          const isEditing = editingInviteeId === invitee.id
          const assignedTableName = tableNameByInviteeId.get(invitee.id)

          return (
            <div
              key={invitee.id}
              className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-stone-700 dark:bg-slate-800 dark:shadow-[0_15px_40px_-30px_rgba(15,23,42,0.65)]"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  {isEditing ? (
                    <input
                      value={editingInviteeName}
                      onChange={(event) => setEditingInviteeName(event.target.value)}
                      className="w-full rounded-lg border border-stone-300 px-3 py-2 font-body outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-200 sm:w-80 dark:border-stone-600 dark:bg-slate-900 dark:text-stone-100 dark:focus:border-rose-600 dark:focus:ring-rose-800"
                    />
                  ) : (
                    <p className="truncate font-body text-lg font-semibold text-stone-900 dark:text-stone-100">
                      {invitee.name}
                    </p>
                  )}

                  <p className={`mt-1 font-body text-sm font-semibold ${
                                assignedTableName
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-red-600 dark:text-red-400'
                              }`}>
                                {assignedTableName
                                  ? `✓ Masa: ${assignedTableName}`
                                  : '✗ Hələ masa təyin edilməyib'}
                              </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          onRenameInvitee(invitee.id, editingInviteeName)
                          setEditingInviteeId(null)
                          setEditingInviteeName('')
                        }}
                        className="cursor-pointer rounded-lg border border-slate-300/50 bg-slate-50/60 px-3 py-1.5 font-body text-sm font-medium text-slate-700 hover:bg-slate-100/60 dark:border-slate-600/50 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-800/60"
                      >
                        Yadda saxla
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingInviteeId(null)
                          setEditingInviteeName('')
                        }}
                        className="cursor-pointer rounded-lg border border-stone-300/40 bg-white px-3 py-1.5 font-body text-sm font-medium text-stone-700 hover:bg-stone-100/40 dark:border-stone-600/40 dark:bg-slate-900 dark:text-stone-400 dark:hover:bg-slate-800"
                      >
                        Ləğv et
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingInviteeId(invitee.id)
                        setEditingInviteeName(invitee.name)
                      }}
                      className="cursor-pointer rounded-lg border border-blue-300/50 bg-blue-50/60 px-3 py-1.5 font-body text-sm font-medium text-blue-700 hover:bg-blue-100/60 dark:border-blue-900/50 dark:bg-blue-950/70 dark:text-blue-300 dark:hover:bg-blue-900/50"
                    >
                      Adı dəyiş
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onRemoveInvitee(invitee.id)}
                    className="cursor-pointer rounded-lg border border-red-300/50 bg-red-50/60 px-3 py-1.5 font-body text-sm font-medium text-red-700 hover:bg-red-100/60 dark:border-red-900/50 dark:bg-red-950/70 dark:text-red-300 dark:hover:bg-red-900/50"
                  >
                    Sil
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
