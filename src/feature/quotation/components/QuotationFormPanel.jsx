import { Button } from "../../../components/ui/button";

function QuotationFormPanel({
  actionLoading,
  actionMessage,
  assetsCatalog,
  contextError,
  contextLoading,
  draft,
  imagePreviews,
  isModal = false,
  payloadError,
  productTypes,
  quoteStatuses,
  suppliesCatalog,
  updateId,
  onAction,
  onChange,
  onClose,
  onFileChange,
}) {
  const updateDraft = (updater) => onChange(updater);
  const updateField = (field) => (event) => {
    const { value } = event.target;
    updateDraft((current) => ({ ...current, [field]: value }));
  };
  const updateVersionField = (field) => (event) => {
    const { value } = event.target;
    updateDraft((current) => ({
      ...current,
      version: { ...current.version, [field]: value },
    }));
  };
  const addExtraCost = () => {
    updateDraft((current) => ({
      ...current,
      version: {
        ...current.version,
        extraCosts: [...current.version.extraCosts, { type: "", cost: "" }],
      },
    }));
  };
  const updateExtraCost = (index, field) => (event) => {
    const { value } = event.target;
    updateDraft((current) => ({
      ...current,
      version: {
        ...current.version,
        extraCosts: current.version.extraCosts.map((item, itemIndex) =>
          itemIndex === index ? { ...item, [field]: value } : item,
        ),
      },
    }));
  };
  const removeExtraCost = (index) => {
    updateDraft((current) => ({
      ...current,
      version: {
        ...current.version,
        extraCosts: current.version.extraCosts.filter(
          (_, itemIndex) => itemIndex !== index,
        ),
      },
    }));
  };
  const addSupply = () => {
    updateDraft((current) => ({
      ...current,
      supplies: [...current.supplies, { suppliesId: "", usageQuantity: "" }],
    }));
  };
  const updateSupply = (index, field) => (event) => {
    const { value } = event.target;
    updateDraft((current) => ({
      ...current,
      supplies: current.supplies.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  };
  const removeSupply = (index) => {
    updateDraft((current) => ({
      ...current,
      supplies: current.supplies.filter((_, itemIndex) => itemIndex !== index),
    }));
  };
  const addAsset = () => {
    updateDraft((current) => ({
      ...current,
      assets: [...current.assets, { assetsId: "", usageQuantity: "" }],
    }));
  };
  const updateAsset = (index, field) => (event) => {
    const { value } = event.target;
    updateDraft((current) => ({
      ...current,
      assets: current.assets.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  };
  const removeAsset = (index) => {
    updateDraft((current) => ({
      ...current,
      assets: current.assets.filter((_, itemIndex) => itemIndex !== index),
    }));
  };
  const removeImage = (image) => {
    updateDraft((current) => ({
      ...current,
      images: current.images.filter((item) => item !== image),
    }));
  };

  return (
    <section className="quotes-panel">
      <div className="quotes-panel-header">
        <h2 className="quotes-panel-title">
          {isModal
            ? `Editar cotizacion ${updateId ? `#${updateId}` : ""}`
            : "Ingresa los datos de la cotizacion"}
        </h2>
        <div className="quotes-toolbar">
          {isModal && (
            <Button variant="secondary" onClick={onClose}>
              Cerrar
            </Button>
          )}
          <Button
            variant="primary"
            onClick={onAction}
            disabled={actionLoading || (isModal && (!updateId || contextLoading))}
          >
            {actionLoading
              ? "Enviando..."
              : isModal
                ? "Guardar cambios"
                : "Crear cotizacion"}
          </Button>
        </div>
      </div>

      {isModal && contextLoading && (
        <p className="quotes-helper">Cargando datos de la cotizacion...</p>
      )}
      {isModal && contextError && <p className="quotes-error">{contextError}</p>}

      <div className="quotes-form-grid">
        <div className="quotes-section">
          <h3 className="quotes-section-title">Detalles</h3>
          <div className="quotes-grid">
            <label className="quotes-field">
              Titulo
              <input type="text" value={draft.title} onChange={updateField("title")} />
            </label>
            <label className="quotes-field">
              Fecha
              <input type="date" value={draft.date} onChange={updateField("date")} />
            </label>
            <label className="quotes-field">
              Estado
              <select value={draft.status} onChange={updateField("status")}>
                {!quoteStatuses.length && (
                  <option value={draft.status}>Sin estados (carga contexto)</option>
                )}
                {quoteStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="quotes-field">
              Tipo producto
              <select value={draft.productType} onChange={updateField("productType")}>
                {!productTypes.length && (
                  <option value={draft.productType}>Sin tipos (carga contexto)</option>
                )}
                {productTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="quotes-field">
            Descripcion
            <textarea
              rows={4}
              value={draft.description}
              onChange={updateField("description")}
            />
          </label>
        </div>

        <div className="quotes-section">
          <h3 className="quotes-section-title">Version</h3>
          <div className="quotes-grid">
            <label className="quotes-field">
              Sub descripcion
              <input
                type="text"
                value={draft.version.subDescription}
                onChange={updateVersionField("subDescription")}
              />
            </label>
            <label className="quotes-field">
              Numero version
              <input
                type="number"
                value={draft.version.versionNumber}
                onChange={updateVersionField("versionNumber")}
              />
            </label>
            <label className="quotes-field">
              Margen (%)
              <input
                type="number"
                value={draft.version.profitMargin}
                onChange={updateVersionField("profitMargin")}
              />
            </label>
            <label className="quotes-field">
              Impuesto producto
              <input
                type="number"
                value={draft.version.productTax}
                onChange={updateVersionField("productTax")}
              />
            </label>
            <label className="quotes-field">
              Costo mano de obra
              <input
                type="number"
                value={draft.version.laborCost}
                onChange={updateVersionField("laborCost")}
              />
            </label>
            <label className="quotes-field">
              Descuento
              <input
                type="number"
                value={draft.version.discount}
                onChange={updateVersionField("discount")}
              />
            </label>
          </div>

          <div className="quotes-section-sub">
            <div className="quotes-section-header">
              <h4 className="quotes-section-title">Extras</h4>
              <Button variant="secondary" size="sm" onClick={addExtraCost}>
                Agregar
              </Button>
            </div>
            <div className="quotes-items">
              {draft.version.extraCosts.map((item, index) => (
                <div className="quotes-item-row" key={`extra-${index}`}>
                  <label className="quotes-field">
                    Tipo
                    <input
                      type="text"
                      value={item.type}
                      onChange={updateExtraCost(index, "type")}
                    />
                  </label>
                  <label className="quotes-field">
                    Costo
                    <input
                      type="number"
                      value={item.cost}
                      onChange={updateExtraCost(index, "cost")}
                    />
                  </label>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => removeExtraCost(index)}
                  >
                    Quitar
                  </Button>
                </div>
              ))}
              {!draft.version.extraCosts.length && (
                <p className="quotes-empty">Sin extras agregados.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="quotes-form-grid">
        <div className="quotes-section">
          <div className="quotes-section-header">
            <h3 className="quotes-section-title">Insumos</h3>
            <Button variant="secondary" size="sm" onClick={addSupply}>
              Agregar
            </Button>
          </div>
          <div className="quotes-items">
            {draft.supplies.map((item, index) => (
              <div className="quotes-item-row" key={`supply-${index}`}>
                <label className="quotes-field">
                  Insumo
                  <select
                    value={item.suppliesId}
                    onChange={updateSupply(index, "suppliesId")}
                  >
                    <option value="">Selecciona</option>
                    {suppliesCatalog.map((supply) => (
                      <option key={supply.id} value={supply.id}>
                        {supply.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="quotes-field">
                  Cantidad
                  <input
                    type="number"
                    value={item.usageQuantity}
                    onChange={updateSupply(index, "usageQuantity")}
                  />
                </label>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => removeSupply(index)}
                >
                  Quitar
                </Button>
              </div>
            ))}
            {!draft.supplies.length && (
              <p className="quotes-empty">Sin insumos agregados.</p>
            )}
          </div>
        </div>

        <div className="quotes-section">
          <div className="quotes-section-header">
            <h3 className="quotes-section-title">Activos</h3>
            <Button variant="secondary" size="sm" onClick={addAsset}>
              Agregar
            </Button>
          </div>
          <div className="quotes-items">
            {draft.assets.map((item, index) => (
              <div className="quotes-item-row" key={`asset-${index}`}>
                <label className="quotes-field">
                  Activo
                  <select
                    value={item.assetsId}
                    onChange={updateAsset(index, "assetsId")}
                  >
                    <option value="">Selecciona</option>
                    {assetsCatalog.map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="quotes-field">
                  Cantidad
                  <input
                    type="number"
                    value={item.usageQuantity}
                    onChange={updateAsset(index, "usageQuantity")}
                  />
                </label>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => removeAsset(index)}
                >
                  Quitar
                </Button>
              </div>
            ))}
            {!draft.assets.length && (
              <p className="quotes-empty">Sin activos agregados.</p>
            )}
          </div>
        </div>
      </div>

      <div className="quotes-form-grid">
        <div className="quotes-section">
          <h3 className="quotes-section-title">Imagenes</h3>
          <label className="quotes-field">
            Subir imagenes
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(event) =>
                onFileChange(event.target.files ? Array.from(event.target.files) : [])
              }
            />
          </label>
          {!!draft.images.length && (
            <div className="quotes-tags">
              {draft.images.map((image) => (
                <span className="quotes-tag" key={image}>
                  {image}
                  <button type="button" onClick={() => removeImage(image)}>
                    x
                  </button>
                </span>
              ))}
            </div>
          )}
          {!!imagePreviews.length && (
            <div className="quotes-image-grid">
              {imagePreviews.map((preview) => (
                <img key={preview.url} src={preview.url} alt={preview.file.name} />
              ))}
            </div>
          )}
        </div>
      </div>

      {payloadError && <p className="quotes-error">{payloadError}</p>}
      {actionMessage && <p className="quotes-helper">{actionMessage}</p>}
    </section>
  );
}

export default QuotationFormPanel;
