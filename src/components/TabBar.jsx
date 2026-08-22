const TABS = [
  { id: "planning", label: "Planning" },
  { id: "calendario", label: "Calendario" },
  { id: "gastos", label: "$" },
  { id: "resumen", label: "Resumen" },
];

export default function TabBar({ tab, onCambiar }) {
  return (
    <nav className="tabs">
      {TABS.map((t) => (
        <button key={t.id} className={`t ${tab === t.id ? "on" : ""}`} onClick={() => onCambiar(t.id)}>
          {t.label}
        </button>
      ))}
    </nav>
  );
}
