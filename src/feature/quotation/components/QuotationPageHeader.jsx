import { Button } from "../../../components/ui/button";

function QuotationPageHeader({
  activeTab,
  actionLoading,
  canUpdate,
  onGoList,
  onGoCreate,
  onLoadNewContext,
  onOpenNew,
  onReload,
  onUpdate,
}) {
  const title =
    activeTab === "listado"
      ? "Listado y filtros"
      : activeTab === "contexto"
        ? "Contexto y desglose"
        : "Crear y editar";

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
        ) : activeTab === "contexto" ? (
          <>
            <Button variant="secondary" onClick={onGoCreate}>
              Ir a crear
            </Button>
            <Button variant="primary" onClick={onLoadNewContext}>
              Contexto nuevo
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
            <Button
              variant="secondary"
              onClick={onUpdate}
              disabled={actionLoading || !canUpdate}
            >
              {actionLoading ? "Enviando..." : "Actualizar cotizacion"}
            </Button>
          </>
        )}
      </div>
    </header>
  );
}

export default QuotationPageHeader;
