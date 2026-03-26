type StatsPanelProps = {
  totalInvitees: number
  assignedInvitees: number
  unassignedCount: number
  totalTables: number
  totalCapacity: number
  occupancyPercent: number
}

export function StatsPanel({
  totalInvitees,
  assignedInvitees,
  unassignedCount,
  totalTables,
  totalCapacity,
  occupancyPercent,
}: Readonly<StatsPanelProps>) {
  const cards = [
    { label: 'Ümumi dəvətli', value: totalInvitees },
    { label: 'Yerləşdirilən', value: assignedInvitees },
    { label: 'Boşda qalan', value: unassignedCount },
    { label: 'Masa sayı', value: totalTables },
    { label: 'Ümumi tutum', value: totalCapacity },
  ]

  return (
    <section className="mb-6 rounded-3xl border border-stone-200/80 bg-gradient-to-br from-white via-amber-50/30 to-rose-50/40 p-4 shadow-[0_20px_50px_-38px_rgba(51,65,85,0.65)] sm:p-5">
      <div className="grid gap-3 lg:grid-cols-[1.1fr_2fr]">
        <article className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
          <p className="font-body text-xs uppercase tracking-[0.13em] text-emerald-700">Doluluq dərəcəsi</p>
          <p className="mt-1 font-display text-5xl text-emerald-900">{occupancyPercent}%</p>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-emerald-100">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all duration-500"
              style={{ width: `${Math.min(occupancyPercent, 100)}%` }}
            />
          </div>
        </article>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <article
              key={card.label}
              className="rounded-2xl border border-stone-200/80 bg-white/85 px-4 py-4 shadow-[0_15px_40px_-30px_rgba(51,65,85,0.55)] backdrop-blur-sm"
            >
              <p className="font-body text-xs uppercase tracking-[0.12em] text-stone-500">
                {card.label}
              </p>
              <p className="mt-1 font-display text-3xl text-stone-900">{card.value}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
