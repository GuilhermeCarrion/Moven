// Prazo: até ele o aluno cancela sem custo; nele o worker debita o crédito
export function cancelDeadline(startAtIso: string, windowHours: number) {
  const at = new Date(new Date(startAtIso).getTime() - windowHours * 3_600_000);
  return {
    open: at.getTime() > Date.now(),
    label: at.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}
