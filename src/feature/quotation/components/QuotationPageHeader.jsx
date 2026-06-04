import { Button } from "../../../components/ui/button";

function QuotationPageHeader({
  activeTab,
  onGoList,
  onLoadNewContext,
  onOpenNew,
  onReload,
}) {
  const title = activeTab === "listado" ? "Listado y filtros" : "Crear cotizacion";

  return (
    <header className="quotes-header">
      <div>
        <p className="quotes-kicker">Cotizaciones</p>
        <h1 className="quotes-title">{title}</h1>
        <p className="quotes-subtitle">
          Consulta, crea y actualiza cotizaciones desde la UI.
        </p>
      </div>
      <div className="quotes-toolbar">
        {activeTab === "listado" ? (
          <>
            <Button variant="secondary" onClick={onReload}>
              Recargar lista
            </Button>
            <Button variant="primary" onClick={onOpenNew}>
              Crear cotizacion
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={onGoList}>
              Ir al listado
            </Button>
            <Button variant="primary" onClick={onLoadNewContext}>
              Contexto nuevo
            </Button>
          </>
        )}
      </div>
    </header>
  );
}

export default QuotationPageHeader;
 