type StatusCardProps = {
  title: string;
  status: string;
  detail: string;
};

export function StatusCard({ title, status, detail }: StatusCardProps) {
  return (
    <article className="status-card">
      <div className="status-card__header">
        <h3>{title}</h3>
        <span>{status}</span>
      </div>
      <p>{detail}</p>
    </article>
  );
}
