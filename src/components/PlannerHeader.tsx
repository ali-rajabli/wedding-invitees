import type { Section } from '../types/planner'

type PlannerHeaderProps = {
  section: Section
  onSectionChange: (section: Section) => void
  inviteeCount: number
  tableCount: number
  assignedCount: number
  notice: string
  onExcelExport: () => void
  onExcelImportClick: () => void
}

export function PlannerHeader({
  section,
  onSectionChange,
  inviteeCount,
  tableCount,
  assignedCount,
  notice,
  onExcelExport,
  onExcelImportClick,
}: Readonly<PlannerHeaderProps>) {
  const tabs: Array<{ key: Section; label: string; count: number }> = [
    { key: 'invitees', label: 'Dəvətlilər', count: inviteeCount },
    { key: 'tables', label: 'Masalar', count: tableCount },
    { key: 'seating', label: 'Yerləşdirmə', count: assignedCount },
  ]

  return (
    <header className="mb-8 rounded-3xl border border-rose-200/70 bg-white/80 p-6 shadow-[0_20px_70px_-35px_rgba(146,64,14,0.45)] backdrop-blur-sm sm:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="font-body text-sm uppercase tracking-[0.25em] text-rose-500">
            Toy Planlayıcısı
          </p>
          <h1 className="mt-2 font-display text-4xl text-stone-900 sm:text-5xl">
            Toy Dəvətliləri və Masalar
          </h1>
          <p className="mt-3 max-w-3xl font-body text-stone-600">
            Dəvətliləri idarə et, masalar yarat və yerləşdirməni çox rahat şəkildə apar.
          </p>
        </div>

        <div className="w-full rounded-2xl border border-stone-200/80 bg-white/90 p-3 shadow-sm lg:w-96">
          <p className="px-1 font-body text-xs uppercase tracking-[0.15em] text-stone-500">
            Məlumat əməliyyatları
          </p>
          <div className="mt-2 grid gap-2">
            <button
              type="button"
              onClick={onExcelImportClick}
              className="cursor-pointer rounded-lg border border-blue-200 bg-blue-50/70 px-3 py-2.5 text-left font-body text-sm font-semibold text-blue-700 transition hover:bg-blue-100/70"
            >
              📥 Excel-dən import et
            </button>
            <button
              type="button"
              onClick={onExcelExport}
              className="cursor-pointer rounded-lg border border-emerald-200 bg-emerald-50/70 px-3 py-2.5 text-left font-body text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100/70"
            >
              📤 Excel-ə export et
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {tabs.map((item) => {
          const isActive = section === item.key
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSectionChange(item.key)}
              className={`cursor-pointer rounded-2xl border px-4 py-3 text-left transition duration-200 ${
                isActive
                  ? item.key === 'invitees'
                    ? 'border-rose-300 bg-rose-100/80 shadow-sm'
                    : item.key === 'tables'
                    ? 'border-blue-300 bg-blue-100/80 shadow-sm'
                    : 'border-emerald-300 bg-emerald-100/80 shadow-sm'
                  : item.key === 'invitees'
                  ? 'border-rose-200/50 bg-rose-50/40 hover:-translate-y-0.5 hover:shadow-sm'
                  : item.key === 'tables'
                  ? 'border-blue-200/50 bg-blue-50/40 hover:-translate-y-0.5 hover:shadow-sm'
                  : 'border-emerald-200/50 bg-emerald-50/40 hover:-translate-y-0.5 hover:shadow-sm'
              }`}
            >
              <span className="block font-body text-xs uppercase tracking-[0.15em] text-stone-500">
                {item.label}
              </span>
              <span className="mt-1 block font-display text-2xl text-stone-900">
                {item.count}
              </span>
            </button>
          )
        })}
      </div>

      {notice && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 font-body text-sm text-emerald-700">
          {notice}
        </div>
      )}
    </header>
  )
}
