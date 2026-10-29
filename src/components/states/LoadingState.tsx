interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = 'Carregando...' }: LoadingStateProps) {
  return (
    <div
      role="status"
      className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-white shadow-glass backdrop-blur-md sm:p-8"
    >
      <p>{message}</p>
    </div>
  );
}
