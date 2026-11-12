import type { ReactNode } from "react";

interface Props {
  title: string;
  hidden?: boolean;
  children: ReactNode;
}

export function Section({ title, hidden, children }: Props) {
  return (
    <section hidden={hidden}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
