import { type Outcome, OUTCOME_DETAILS, OUTCOMES } from '../constants/outcomes'
import { formatPercent, toPercent } from '../utils/applicationMetrics'

interface OutcomeSplitProps {
  outcomes: Record<Outcome, number>
}

/**
 * A thin segmented bar of how submitted applications split by outcome,
 * with the figures listed beside a swatch for each part.
 */
export function OutcomeSplit({ outcomes }: OutcomeSplitProps) {
  const total = OUTCOMES.reduce((sum, outcome) => sum + outcomes[outcome], 0)

  return (
    <div className="flex flex-col gap-4">
      <div aria-hidden="true" className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-muted">
        {OUTCOMES.filter((outcome) => outcomes[outcome] > 0).map((outcome) => (
          <div
            key={outcome}
            className="h-full first:rounded-l-full last:rounded-r-full"
            style={{ flexGrow: outcomes[outcome], backgroundColor: OUTCOME_DETAILS[outcome].color }}
          />
        ))}
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {OUTCOMES.map((outcome) => (
          <li key={outcome} className="flex items-start gap-2">
            <span
              aria-hidden="true"
              className="mt-1 size-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: OUTCOME_DETAILS[outcome].color }}
            />
            <div className="flex flex-col">
              <span className="text-body">
                <span className="font-medium">{OUTCOME_DETAILS[outcome].label}</span>{' '}
                <span className="tabular-nums">
                  {outcomes[outcome]} ({formatPercent(toPercent(outcomes[outcome], total))})
                </span>
              </span>
              <span className="text-supporting text-muted-foreground">{OUTCOME_DETAILS[outcome].description}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
