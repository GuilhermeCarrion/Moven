"use client";

import { ReactNode } from "react";

export default function Template({ children }: { children: ReactNode }) {
  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 ease-out">
      {children}
    </div>
  );
}
