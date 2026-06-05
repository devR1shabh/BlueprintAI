import { ModuleCard, CountBadge, TypeBadge } from './ModuleCard.jsx'

const Icon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

const typeIcons = {
  human: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  system: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <line x1="8" y1="21" x2="16" y2="21"/>
      <line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  ),
  external: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
}

const typeRingColors = {
  human:    'border-brand-700/40',
  system:   'border-green-700/40',
  external: 'border-purple-700/40',
}

const typeIconColors = {
  human:    'text-brand-400',
  system:   'text-green-400',
  external: 'text-purple-400',
}

function RoleCard({ role }) {
  return (
    <div className={`rounded-xl border ${typeRingColors[role.type] || typeRingColors.human} bg-surface-800/30 p-4`}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className={typeIconColors[role.type] || typeIconColors.human}>
            {typeIcons[role.type] || typeIcons.human}
          </span>
          <span className="font-display font-700 text-sm text-white">{role.name}</span>
        </div>
        <TypeBadge type={role.type} />
      </div>

      {role.responsibilities && role.responsibilities.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {role.responsibilities.map((resp, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-surface-400">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-surface-600 shrink-0" />
              <span className="leading-relaxed min-w-0">{resp}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function RolesModule({ roles, index }) {
  if (!roles || roles.length === 0) return null

  const humans   = roles.filter(r => r.type === 'human')
  const systems  = roles.filter(r => r.type === 'system')
  const external = roles.filter(r => r.type === 'external')

  return (
    <ModuleCard
      id="roles"
      icon={<Icon />}
      title="Roles & Actors"
      index={index}
      badge={<CountBadge count={roles.length} label="roles" />}
    >
      {/* Type summary strip */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-surface-800/50">
        {humans.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-surface-400">
            <span className="text-brand-400">{typeIcons.human}</span>
            <span>{humans.length} Human</span>
          </div>
        )}
        {external.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-surface-400">
            <span className="text-purple-400">{typeIcons.external}</span>
            <span>{external.length} External</span>
          </div>
        )}
        {systems.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-surface-400">
            <span className="text-green-400">{typeIcons.system}</span>
            <span>{systems.length} System</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {roles.map(role => (
          <RoleCard key={role.id} role={role} />
        ))}
      </div>
    </ModuleCard>
  )
}