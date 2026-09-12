import { MessageSquare } from "lucide-react";

export default function MensagensPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-cyan-500/10 text-[var(--primary)]">
        <MessageSquare className="h-9 w-9" />
      </div>

      <h1 className="mt-6 text-2xl font-semibold text-gray-900">Mensagens</h1>

      <p className="mt-2 max-w-md text-gray-500">
        Esta funcionalidade está em desenvolvimento. Em breve você poderá
        conversar com seus alunos pelo WhatsApp direto por aqui.
      </p>

      <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--highlight)]/20 px-4 py-1.5 text-sm font-medium text-[var(--highlight-foreground)]">
        🚧 Em desenvolvimento
      </span>
    </div>
  );
}
