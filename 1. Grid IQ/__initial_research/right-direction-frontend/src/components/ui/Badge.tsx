interface BadgeProps {
  children: React.ReactNode;
  tone?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  withDot?: boolean;
}

export function Badge({ children, tone = 'neutral', withDot = false }: BadgeProps) {
  return (
    <span className={`badge badge-${tone}`}>
      {withDot ? <span className="dot" /> : null}
      {children}
    </span>
  );
}
