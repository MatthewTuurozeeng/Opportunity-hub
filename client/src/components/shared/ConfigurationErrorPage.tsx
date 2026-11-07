interface ConfigurationErrorPageProps {
  missingVariables: readonly string[]
}

/** Shown instead of the app when required environment variables are missing. */
export function ConfigurationErrorPage({ missingVariables }: ConfigurationErrorPageProps) {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <section className="flex max-w-md flex-col gap-3 rounded-lg border border-border bg-card p-6">
        <h1 className="text-section-heading font-semibold">Supabase is not configured</h1>
        <p className="text-body text-muted-foreground">
          Add the following values to <code className="font-mono">client/.env</code>, then restart
          the dev server:
        </p>
        <ul className="list-inside list-disc font-mono text-supporting">
          {missingVariables.map((variableName) => (
            <li key={variableName}>{variableName}</li>
          ))}
        </ul>
        <p className="text-supporting text-muted-foreground">
          Find them in your Supabase dashboard under Project Settings, API.
        </p>
      </section>
    </main>
  )
}
