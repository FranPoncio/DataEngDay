/* Íconos SVG inline: sin librería, heredan color del botón activo. */
const Ico = {
  hoy: <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />,
  plan: <path d="M4 4h16v16H4zM8 12l2.5 2.5L16 9" />,
  gastos: <path d="M12 2v20M17 6.5C17 4.6 14.8 3.5 12 3.5S7 4.6 7 6.5s2.2 3 5 3.5 5 1.6 5 3.5-2.2 3-5 3-5-1.1-5-3" />,
  resumen: <path d="M21 12a9 9 0 1 1-9-9v9z" />,
};

const TABS = [
  { id: "hoy", label: "Hoy" },
  { id: "plan", label: "Plan" },
  { id: "gastos", label: "Gastos" },
  { id: "resumen", label: "Resumen" },
];

export default function TabBar({ tab, onCambiar }) {
  return (
    <nav className="tabs">
      {TABS.map((t) => (
        <button key={t.id} className={`t ${tab === t.id ? "on" : ""}`}
          onClick={() => onCambiar(t.id)} aria-current={tab === t.id ? "page" : undefined}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {Ico[t.id]}
          </svg>
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
