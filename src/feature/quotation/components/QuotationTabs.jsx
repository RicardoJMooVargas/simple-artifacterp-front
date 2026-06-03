const tabs = [
  { key: "crear", label: "Crear cotizacion" },
  { key: "listado", label: "Filtros y tabla" },
  { key: "contexto", label: "Contexto y desglose" },
];

function QuotationTabs({ activeTab, onChange }) {
  return (
    <nav className="config-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          className={`config-tab ${activeTab === tab.key ? "active" : ""}`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

export default QuotationTabs;
