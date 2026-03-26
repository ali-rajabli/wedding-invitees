import { useMemo, useState } from 'react'
import type { TableFilter, WeddingTable } from '../types/planner'

type TablesSectionProps = {
  tables: WeddingTable[]
  onAddTable: (name: string, capacity: string) => void
  onEditTable: (tableId: string, name: string, capacity: string) => void
  onRemoveTable: (tableId: string) => void
}

export function TablesSection({
  tables,
  onAddTable,
  onEditTable,
  onRemoveTable,
}: Readonly<TablesSectionProps>) {
  const [tableName, setTableName] = useState('')
  const [tableCapacity, setTableCapacity] = useState('8')

  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<TableFilter>('all')

  const [editingTableId, setEditingTableId] = useState<string | null>(null)
  const [editingTableName, setEditingTableName] = useState('')
  const [editingTableCapacity, setEditingTableCapacity] = useState('')

  const filteredTables = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return tables.filter((table) => {
      const isFull = table.inviteeIds.length >= table.capacity
      const matchesFilter =
        filter === 'all' ||
        (filter === 'available' && !isFull) ||
        (filter === 'full' && isFull)
      const matchesQuery = !query || table.name.toLowerCase().includes(query)

      return matchesFilter && matchesQuery
    })
  }, [tables, filter, searchTerm])

  const totalCapacity = tables.reduce((sum, table) => sum + table.capacity, 0)
  const filledSeats = tables.reduce((sum, table) => sum + table.inviteeIds.length, 0)
  const availableSeats = Math.max(0, totalCapacity - filledSeats)

  return (
    <section className="rounded-3xl border border-stone-200/70 bg-white/90 p-5 shadow-[0_20px_80px_-40px_rgba(30,41,59,0.45)] sm:p-7">
      <h2 className="font-display text-3xl text-stone-900">Masalar</h2>
      <p className="mt-2 font-body text-stone-600">Masa adı və tutumu daxil et.</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-stone-300/40 bg-stone-100/60 px-4 py-3">
          <p className="font-body text-xs uppercase tracking-[0.14em] text-stone-600">Masa sayı</p>
          <p className="font-display text-3xl text-stone-900">{tables.length}</p>
        </div>
        <div className="rounded-xl border border-stone-300/40 bg-stone-100/60 px-4 py-3">
          <p className="font-body text-xs uppercase tracking-[0.14em] text-stone-600">Ümumi tutum</p>
          <p className="font-display text-3xl text-stone-900">{totalCapacity}</p>
        </div>
        <div className="rounded-xl border border-stone-300/40 bg-stone-100/60 px-4 py-3">
          <p className="font-body text-xs uppercase tracking-[0.14em] text-stone-600">Boş yerlər</p>
          <p className="font-display text-3xl text-stone-900">{availableSeats}</p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <form
            onSubmit={(event) => {
              event.preventDefault()
              onAddTable(tableName, tableCapacity)
              setTableName('')
              setTableCapacity('8')
            }}
            className="rounded-2xl border border-stone-300/40 bg-stone-50/50 p-4"
          >
            <div className="grid gap-3 sm:grid-cols-4">
              <label className="font-body text-sm font-medium text-stone-700 sm:col-span-2">
                <span>Masa adı</span>
                <input
                  value={tableName}
                  onChange={(event) => setTableName(event.target.value)}
                  placeholder="Məsələn: VIP Masa"
                  className="mt-1.5 w-full rounded-xl border border-stone-300/60 bg-white px-4 py-2.5 font-body outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
              </label>
              <label className="font-body text-sm font-medium text-stone-700">
                <span>Tutum</span>
                <input
                  type="number"
                  min={1}
                  value={tableCapacity}
                  onChange={(event) => setTableCapacity(event.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-stone-300/60 bg-white px-4 py-2.5 font-body outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
              </label>
              <button
                type="submit"
                className="cursor-pointer rounded-xl bg-slate-700 px-5 py-2.5 font-body font-semibold text-white transition hover:bg-slate-600"
              >
                + Əlavə et
              </button>
            </div>
            </form>
      </div>

      <div className="mt-4 space-y-3">
        <div className="grid gap-3 rounded-2xl border border-stone-300/40 bg-stone-50/50 p-4 sm:grid-cols-3">
            <label className="font-body text-sm font-medium text-stone-700 sm:col-span-2">
              <span>Axtarış</span>
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Masa adına görə axtar"
                className="mt-1.5 w-full rounded-xl border border-stone-300/60 bg-white px-4 py-2.5 font-body outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </label>
            <label className="font-body text-sm font-medium text-stone-700">
              <span>Filter</span>
              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value as TableFilter)}
                className="mt-1.5 cursor-pointer w-full rounded-xl border border-stone-300/60 bg-white px-4 py-2.5 font-body outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              >
                <option value="all">Bütün masalar</option>
                <option value="available">Boş yeri olanlar</option>
                <option value="full">Dolu masalar</option>
              </select>
            </label>
        </div>
      </div>

      <h3 className="mt-6 font-display text-lg text-stone-800">Masalar Siyahısı</h3>

      <div className="mt-4 space-y-3">
        {filteredTables.length === 0 && (
          <p className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-4 font-body text-stone-500">
            Filterə uyğun masa tapılmadı.
          </p>
        )}

        {filteredTables.map((table) => {
          const isEditing = editingTableId === table.id
          return (
            <div
              key={table.id}
              className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="grid gap-2 sm:grid-cols-2">
                  {isEditing ? (
                    <>
                      <input
                        value={editingTableName}
                        onChange={(event) => setEditingTableName(event.target.value)}
                        className="rounded-lg border border-stone-300 px-3 py-2 font-body outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
                      />
                      <input
                        type="number"
                        min={1}
                        value={editingTableCapacity}
                        onChange={(event) => setEditingTableCapacity(event.target.value)}
                        className="rounded-lg border border-stone-300 px-3 py-2 font-body outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
                      />
                    </>
                  ) : (
                    <>
                      <p className="font-body text-lg font-semibold text-stone-900">{table.name}</p>
                      <p className="font-body text-sm text-stone-600">
                        Tutum: {table.capacity} | Doluq: {table.inviteeIds.length}
                      </p>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          onEditTable(table.id, editingTableName, editingTableCapacity)
                          setEditingTableId(null)
                          setEditingTableName('')
                          setEditingTableCapacity('')
                        }}
                        className="cursor-pointer rounded-lg border border-slate-300/50 bg-slate-50/60 px-3 py-1.5 font-body text-sm font-medium text-slate-700 hover:bg-slate-100/60"
                      >
                        Yadda saxla
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTableId(null)
                          setEditingTableName('')
                          setEditingTableCapacity('')
                        }}
                        className="cursor-pointer rounded-lg border border-stone-300/40 bg-white px-3 py-1.5 font-body text-sm font-medium text-stone-700 hover:bg-stone-100/40"
                      >
                        Ləğv et
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTableId(table.id)
                        setEditingTableName(table.name)
                        setEditingTableCapacity(String(table.capacity))
                      }}
                      className="cursor-pointer rounded-lg border border-blue-300/50 bg-blue-50/60 px-3 py-1.5 font-body text-sm font-medium text-blue-700 hover:bg-blue-100/60"
                    >
                      Adı dəyiş
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onRemoveTable(table.id)}
                    className="cursor-pointer rounded-lg border border-red-300/50 bg-red-50/60 px-3 py-1.5 font-body text-sm font-medium text-red-700 hover:bg-red-100/60"
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
