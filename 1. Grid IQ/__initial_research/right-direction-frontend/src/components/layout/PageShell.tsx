interface PageShellProps {
  title: string;
  eyebrow?: string;
  description: string;
  children: React.ReactNode;
}

export function PageShell({ title, eyebrow, description, children }: PageShellProps) {
  return (
    <main className="page-shell">
      <header className="page-header">
        {eyebrow ? <span className="page-eyebrow">{eyebrow}</span> : null}
        <h1>{title}</h1>
        <p>{description}</p>
      </header>
      {children}
    </main>
  );
}
