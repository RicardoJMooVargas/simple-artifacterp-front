import { Button } from "../../../components/ui/button";

function SummaryItem({ label, value }) {
  return (
    <div>
      <p className="quotes-meta">{label}</p>
      <p className="quotes-summary-value">{value}</p>
    </div>
  );
}

function QuotationContextView({
  assetsCatalog,
  contextData,
  contextError,
  contextId,
  contextLoading,
  costBreakdown,
  productTypes,
  quoteStatuses,
  suppliesCatalog,
  onContextIdChange,
  onLoadContext,
}) {
  const costItems = [
    ["Materiales", costBreakdown?.materialsCost ?? 0],
    ["Activos", costBreakdown?.assetsCost ?? 0],
    ["Mano de obra", costBreakdown?.laborCost ?? 0],
    ["Extras", costBreakdown?.extraCosts ?? 0],
    ["Base", costBreakdown?.baseCost ?? 0],
    ["Margen", `${costBreakdown?.profitMargin ?? 0}%`],
    ["Ganancia", costBreakdown?.profit ?? 0],
    ["Subtotal", costBreakdown?.subTotal ?? 0],
    ["Descuento", costBreakdown?.discount ?? 0],
    ["Impuesto", costBreakdown?.productTax ?? 0],
    ["Total", costBreakdown?.totalCost ?? 0],
  ];

  return (
    <>
      <section className="quotes-panel">
        <div className="quotes-panel-header">
          <h2 className="quotes-panel-title">Contexto</h2>
          <div className="quotes-toolbar">
            <label className="quotes-field inline">
              QuotationId
              <input
                type="number"
                value={contextId}
                onChange={(event) => onContextIdChange(event.target.value)}
              />
            </label>
            <Button
              variant="secondary"
              onClick={() => onLoadContext()}
              disabled={contextLoading}
            >
              {contextLoading ? "Cargando..." : "Cargar"}
            </Button>
          </div>
        </div>
        {contextError && <p className="quotes-error">{contextError}</p>}
        <div className="quotes-summary">
          <SummaryItem
            label="Catalogos"
            value={`${suppliesCatalog.length} insumos - ${assetsCatalog.length} assets`}
          />
          <SummaryItem
            label="Enums"
            value={`${productTypes.length} tipos - ${quoteStatuses.length} estados`}
          />
          <SummaryItem
            label="Costo electricidad"
            value={contextData?.costOfElectricity ?? 0}
          />
        </div>
      </section>

      <section className="quotes-panel">
        <div className="quotes-panel-header">
          <h2 className="quotes-panel-title">Desglose de costos</h2>
          <span className="quotes-panel-meta">Respuesta del servidor</span>
        </div>
        {costBreakdown ? (
          <>
            <div className="quotes-summary">
              {costItems.map(([label, value]) => (
                <SummaryItem key={label} label={label} value={value} />
              ))}
            </div>
            <div className="quotes-items">
              {Array.isArray(costBreakdown.supplies) &&
                costBreakdown.supplies.map((item, index) => (
                  <div className="quotes-item-row" key={`cost-${index}`}>
                    <SummaryItem label="Insumo" value={item.name} />
                    <SummaryItem
                      label="Cantidad"
                      value={item.usageQuantity ?? 0}
                    />
                    <SummaryItem label="Costo" value={item.cost ?? 0} />
                  </div>
                ))}
              {!costBreakdown.supplies?.length && (
                <p className="quotes-empty">Sin insumos en el desglose.</p>
              )}
            </div>
          </>
        ) : (
          <p className="quotes-helper">
            El desglose aparecera cuando el servidor calcule los costos.
          </p>
        )}
      </section>
    </>
  );
}

export default QuotationContextView;
