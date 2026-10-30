"use client";

import { useState } from "react";

/**
 * Lado de entrada da troca de conteúdo (aba, dia, filtro): o que vem "depois" entra pela direita.
 * Recebe as posições atuais (índice da aba, data em ms...); vale a primeira que mudou.
 * 12px: cabe no padding do main (16px), então não abre rolagem lateral durante a animação.
 */
export function useSlideIn(...values: number[]) {
  const [prev, setPrev] = useState(values);
  const [cls, setCls] = useState("slide-in-from-right-3");
  const i = values.findIndex((v, k) => v !== prev[k]);
  if (i !== -1) {
    // padrão do React para reagir à mudança de props durante o render
    setPrev(values);
    setCls(values[i] > prev[i] ? "slide-in-from-right-3" : "slide-in-from-left-3");
  }
  return cls;
}
