import { useId } from 'react';

interface EmptyStateProps {
  title?: string;
  hint?: string;
}

export default function EmptyState({
  title = 'Nenhuma cidade encontrada',
  hint = 'Verifique o nome da cidade ou tente buscar outra localização.',
}: EmptyStateProps) {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-white shadow-glass backdrop-blur-md sm:p-8"
    >
      <h2 id={headingId} className="break-words text-2xl font-semibold">
        {title}
      </h2>
      <p className="mt-2 break-words text-white/70">{hint}</p>
    </section>
  );
}
