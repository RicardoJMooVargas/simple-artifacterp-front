import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/ui/button'
import { QuotationsService } from '../services/quotations/QuotationsService'

const emptyPayload = {
  title: '',
  date: new Date().toISOString(),
  clientId: 0,
  description: '',
  status: 0,
  productType: 0,
  images: [],
  lastEditedByName: '',
  version: {
    subDescription: '',
    versionNumber: 1,
    profitMargin: 0,
    extraCosts: [],
    productTax: 0,
    laborCost: 0,
    discount: 0,
    lastEditedByName: '',
  },
  supplies: [],
  assets: [],
}

const formatDate = (value) => {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString('es-MX')
}

const toDateInputValue = (value) => {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toISOString().slice(0, 10)
}

const toNumber = (value) =>
  value === '' || value === null || value === undefined ? 0 : Number(value)

function Cotizaciones() {
  const [view, setView] = useState('list')
  const [filters, setFilters] = useState({
    year: '',
    month: '',
    productType: '',
    status: '',
    search: '',
  })
  const [quotations, setQuotations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [contextId, setContextId] = useState('')
  const [contextLoading, setContextLoading] = useState(false)
  const [contextError, setContextError] = useState('')
  const [contextData, setContextData] = useState(null)
  const [formData, setFormData] = useState({
    ...emptyPayload,
    date: toDateInputValue(emptyPayload.date),
  })
  const [payloadError, setPayloadError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionMessage, setActionMessage] = useState('')
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [updateId, setUpdateId] = useState('')

  const filtersReady = useMemo(() => {
    if (!filters.year && !filters.month) {
      return true
    }
    return Boolean(filters.year && filters.month)
  }, [filters.month, filters.year])

  useEffect(() => {
    void loadQuotations()
  }, [])

  useEffect(() => {
    if (!imageFiles.length) {
      setImagePreviews([])
      return undefined
    }

    const previews = imageFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }))
    setImagePreviews(previews)

    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url))
    }
  }, [imageFiles])

  const loadQuotations = async (overrideFilters) => {
    setLoading(true)
    setError('')

    try {
      const activeFilters = overrideFilters ?? filters
      if (!filtersReady) {
        throw new Error('Debes enviar mes y anio para filtrar por fecha.')
      }

      const data = await QuotationsService.listQuotations({
        year: activeFilters.year || undefined,
        month: activeFilters.month || undefined,
        productType: activeFilters.productType || undefined,
        status: activeFilters.status || undefined,
        search: activeFilters.search || undefined,
      })
      setQuotations(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err?.message ?? 'Error al cargar cotizaciones')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key) => (event) => {
    setFilters((current) => ({
      ...current,
      [key]: event.target.value,
    }))
  }

  const handleSearch = (event) => {
    event.preventDefault()
    void loadQuotations()
  }

  const resetFormState = () => {
    setContextId('')
    setUpdateId('')
    setContextData(null)
    setContextError('')
    setFormData({
      ...emptyPayload,
      date: toDateInputValue(new Date().toISOString()),
    })
    setPayloadError('')
    setActionMessage('')
    setImageFiles([])
  }

  const applyContextToForm = (response) => {
    const quotation = response?.quotation?.quotation
    const version = response?.quotation?.version

    if (!quotation) {
      setFormData((current) => ({
        ...current,
        date: current.date || toDateInputValue(new Date().toISOString()),
      }))
      return
    }

    setFormData({
      title: quotation.title ?? '',
      date: toDateInputValue(quotation.date),
      clientId: quotation.clientId ?? 0,
      description: quotation.description ?? '',
      status: quotation.status ?? 0,
      productType: quotation.productType ?? 0,
      images: Array.isArray(quotation.images) ? quotation.images : [],
      lastEditedByName: quotation.lastEditedByName ?? '',
      version: {
        subDescription: version?.subDescription ?? '',
        versionNumber: version?.versionNumber ?? 1,
        profitMargin: version?.profitMargin ?? 0,
        extraCosts: Array.isArray(version?.extraCosts)
          ? version.extraCosts
          : [],
        productTax: version?.productTax ?? 0,
        laborCost: version?.laborCost ?? 0,
        discount: version?.discount ?? 0,
        lastEditedByName: version?.lastEditedByName ?? '',
      },
      supplies: Array.isArray(response?.quotation?.supplies)
        ? response.quotation.supplies.map((item) => ({
            suppliesId: item.suppliesId ?? '',
            usageQuantity: item.usageQuantity ?? 0,
          }))
        : [],
      assets: Array.isArray(response?.quotation?.assets)
        ? response.quotation.assets.map((item) => ({
            assetsId: item.assetsId ?? '',
            usageQuantity: item.usageQuantity ?? 0,
          }))
        : [],
    })
  }

  const handleLoadContext = async (useId) => {
    setContextLoading(true)
    setContextError('')
    setContextData(null)

    try {
      const idToUse = useId ?? contextId
      const response = await QuotationsService.getContext(
        idToUse ? Number(idToUse) : undefined
      )
      setContextData(response)
      applyContextToForm(response)
      if (response?.quotation?.quotation?.quotationId) {
        setUpdateId(String(response.quotation.quotation.quotationId))
      }
    } catch (err) {
      setContextError(err?.message ?? 'Error al cargar contexto')
    } finally {
      setContextLoading(false)
    }
  }

  const handleOpenNew = () => {
    resetFormState()
    setView('form')
    void handleLoadContext('')
  }

  const handleOpenEdit = (quotationId) => {
    resetFormState()
    setContextId(String(quotationId))
    setUpdateId(String(quotationId))
    setView('form')
    void handleLoadContext(quotationId)
  }

  const buildPayload = () => {
    if (!formData.title) {
      setPayloadError('El titulo es obligatorio.')
      return null
    }

    setPayloadError('')

    return {
      title: formData.title,
      date: formData.date
        ? new Date(formData.date).toISOString()
        : new Date().toISOString(),
      clientId: toNumber(formData.clientId),
      description: formData.description,
      status: toNumber(formData.status),
      productType: toNumber(formData.productType),
      images: Array.isArray(formData.images) ? formData.images : [],
      lastEditedByName: formData.lastEditedByName,
      version: {
        subDescription: formData.version.subDescription,
        versionNumber: toNumber(formData.version.versionNumber || 1),
        profitMargin: toNumber(formData.version.profitMargin),
        extraCosts: Array.isArray(formData.version.extraCosts)
          ? formData.version.extraCosts
              .filter((item) => item.type)
              .map((item) => ({
                type: item.type,
                cost: toNumber(item.cost),
              }))
          : [],
        productTax: toNumber(formData.version.productTax),
        laborCost: toNumber(formData.version.laborCost),
        discount: toNumber(formData.version.discount),
        lastEditedByName: formData.version.lastEditedByName,
      },
      supplies: Array.isArray(formData.supplies)
        ? formData.supplies
            .filter((item) => item.suppliesId)
            .map((item) => ({
              suppliesId: item.suppliesId,
              usageQuantity: toNumber(item.usageQuantity),
            }))
        : [],
      assets: Array.isArray(formData.assets)
        ? formData.assets
            .filter((item) => item.assetsId)
            .map((item) => ({
              assetsId: item.assetsId,
              usageQuantity: toNumber(item.usageQuantity),
            }))
        : [],
    }
  }

  const handleCreate = async () => {
    const payload = buildPayload()
    if (!payload) {
      return
    }

    setActionLoading(true)
    setActionMessage('')
    try {
      const response = await QuotationsService.createQuotation(payload, imageFiles)
      setContextData(response)
      applyContextToForm(response)
      const responseId = response?.quotation?.quotation?.quotationId
      if (responseId) {
        setUpdateId(String(responseId))
        setContextId(String(responseId))
      }
      setActionMessage('Cotizacion creada. Ahora puedes editarla.')
    } catch (err) {
      setActionMessage(err?.message ?? 'Error al crear cotizacion')
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdate = async () => {
    const payload = buildPayload()
    if (!payload) {
      return
    }

    if (!updateId) {
      setActionMessage('Ingresa un id para actualizar.')
      return
    }

    setActionLoading(true)
    setActionMessage('')
    try {
      const response = await QuotationsService.updateQuotation(
        Number(updateId),
        payload,
        imageFiles
      )
      setContextData(response)
      applyContextToForm(response)
      setActionMessage('Cotizacion actualizada. Contexto actualizado.')
    } catch (err) {
      setActionMessage(err?.message ?? 'Error al actualizar cotizacion')
    } finally {
      setActionLoading(false)
    }
  }

  const handleFormFieldChange = (field) => (event) => {
    setFormData((current) => ({
      ...current,
      [field]: event.target.value,
    }))
  }

  const handleVersionFieldChange = (field) => (event) => {
    setFormData((current) => ({
      ...current,
      version: {
        ...current.version,
        [field]: event.target.value,
      },
    }))
  }

  const handleAddExtraCost = () => {
    setFormData((current) => ({
      ...current,
      version: {
        ...current.version,
        extraCosts: [
          ...current.version.extraCosts,
          { type: '', cost: '' },
        ],
      },
    }))
  }

  const handleExtraCostChange = (index, field) => (event) => {
    const value = event.target.value
    setFormData((current) => ({
      ...current,
      version: {
        ...current.version,
        extraCosts: current.version.extraCosts.map((item, itemIndex) =>
          itemIndex === index ? { ...item, [field]: value } : item
        ),
      },
    }))
  }

  const handleRemoveExtraCost = (index) => () => {
    setFormData((current) => ({
      ...current,
      version: {
        ...current.version,
        extraCosts: current.version.extraCosts.filter(
          (_, itemIndex) => itemIndex !== index
        ),
      },
    }))
  }

  const handleAddSupply = () => {
    setFormData((current) => ({
      ...current,
      supplies: [...current.supplies, { suppliesId: '', usageQuantity: '' }],
    }))
  }

  const handleSupplyChange = (index, field) => (event) => {
    const value = event.target.value
    setFormData((current) => ({
      ...current,
      supplies: current.supplies.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }))
  }

  const handleRemoveSupply = (index) => () => {
    setFormData((current) => ({
      ...current,
      supplies: current.supplies.filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  const handleAddAsset = () => {
    setFormData((current) => ({
      ...current,
      assets: [...current.assets, { assetsId: '', usageQuantity: '' }],
    }))
  }

  const handleAssetChange = (index, field) => (event) => {
    const value = event.target.value
    setFormData((current) => ({
      ...current,
      assets: current.assets.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }))
  }

  const handleRemoveAsset = (index) => () => {
    setFormData((current) => ({
      ...current,
      assets: current.assets.filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  const handleRemoveImage = (image) => () => {
    setFormData((current) => ({
      ...current,
      images: current.images.filter((item) => item !== image),
    }))
  }

  const productTypes = contextData?.productTypes ?? []
  const quoteStatuses = contextData?.quoteStatuses ?? []
  const suppliesCatalog = contextData?.suppliesCatalog ?? []
  const assetsCatalog = contextData?.assetsCatalog ?? []

  return (
    <section className="quotes-page">
      <header className="quotes-header">
        <div>
          <p className="quotes-kicker">Cotizaciones</p>
          <h1 className="quotes-title">
            {view === 'list' ? 'Listado' : 'Crear y editar'}
          </h1>
          <p className="quotes-subtitle">
            Consulta, crea y actualiza cotizaciones desde la UI.
          </p>
        </div>
        <div className="quotes-toolbar">
          {view === 'list' ? (
            <>
              <Button variant="secondary" onClick={() => loadQuotations()}>
                Recargar lista
              </Button>
              <Button variant="primary" onClick={handleOpenNew}>
                Nueva cotizacion
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={() => setView('list')}>
                Volver a lista
              </Button>
              <Button variant="primary" onClick={() => handleLoadContext('')}>
                Contexto nuevo
              </Button>
            </>
          )}
        </div>
      </header>

      {view === 'list' ? (
        <>
          <section className="quotes-panel">
            <h2 className="quotes-panel-title">Filtros</h2>
            <form className="quotes-grid" onSubmit={handleSearch}>
              <label className="quotes-field">
                Anio
                <input
                  type="number"
                  min="2000"
                  max="2100"
                  value={filters.year}
                  onChange={handleFilterChange('year')}
                />
              </label>
              <label className="quotes-field">
                Mes
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={filters.month}
                  onChange={handleFilterChange('month')}
                />
              </label>
              <label className="quotes-field">
                Tipo producto
                <input
                  type="number"
                  value={filters.productType}
                  onChange={handleFilterChange('productType')}
                />
              </label>
              <label className="quotes-field">
                Estado
                <input
                  type="number"
                  value={filters.status}
                  onChange={handleFilterChange('status')}
                />
              </label>
              <label className="quotes-field">
                Busqueda
                <input
                  type="text"
                  value={filters.search}
                  onChange={handleFilterChange('search')}
                />
              </label>
              <div className="quotes-actions">
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? 'Cargando...' : 'Buscar'}
                </Button>
              </div>
            </form>
            {!filtersReady && (
              <p className="quotes-helper">
                Para filtrar por fecha debes enviar mes y anio.
              </p>
            )}
            {error && <p className="quotes-error">{error}</p>}
          </section>

          <section className="quotes-panel">
            <div className="quotes-panel-header">
              <h2 className="quotes-panel-title">Lista</h2>
              <span className="quotes-panel-meta">
                {quotations.length} resultados
              </span>
            </div>
            <div className="quotes-list">
              {quotations.map((item) => (
                <article className="quotes-card" key={item.quotationId}>
                  {item.images?.[0] ? (
                    <img
                      className="quotes-image"
                      src={item.images[0]}
                      alt={item.title}
                    />
                  ) : (
                    <div className="quotes-image quotes-image-empty">
                      Sin imagen
                    </div>
                  )}
                  <div>
                    <p className="quotes-meta">ID {item.quotationId}</p>
                    <h3 className="quotes-card-title">{item.title}</h3>
                    <p className="quotes-meta">{formatDate(item.date)}</p>
                    <p className="quotes-meta">
                      Estado {item.status} • Tipo {item.productType}
                    </p>
                    {item.lastEditedByName && (
                      <p className="quotes-meta">
                        Editado por {item.lastEditedByName}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => handleOpenEdit(item.quotationId)}
                  >
                    Editar
                  </Button>
                </article>
              ))}
              {!quotations.length && !loading && (
                <p className="quotes-empty">Sin cotizaciones para mostrar.</p>
              )}
            </div>
          </section>
        </>
      ) : (
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
                    onChange={(event) => setContextId(event.target.value)}
                  />
                </label>
                <Button
                  variant="secondary"
                  onClick={() => handleLoadContext()}
                  disabled={contextLoading}
                >
                  {contextLoading ? 'Cargando...' : 'Cargar'}
                </Button>
              </div>
            </div>
            {contextError && <p className="quotes-error">{contextError}</p>}
            <div className="quotes-summary">
              <div>
                <p className="quotes-meta">Catalogos</p>
                <p className="quotes-summary-value">
                  {suppliesCatalog.length} insumos • {assetsCatalog.length} assets
                </p>
              </div>
              <div>
                <p className="quotes-meta">Enums</p>
                <p className="quotes-summary-value">
                  {productTypes.length} tipos • {quoteStatuses.length} estados
                </p>
              </div>
              <div>
                <p className="quotes-meta">Costo electricidad</p>
                <p className="quotes-summary-value">
                  {contextData?.costOfElectricity ?? 0}
                </p>
              </div>
            </div>
          </section>

          <section className="quotes-panel">
            <div className="quotes-panel-header">
              <h2 className="quotes-panel-title">Crear / Actualizar</h2>
              <span className="quotes-panel-meta">multipart/form-data</span>
            </div>

            <div className="quotes-form-grid">
              <div className="quotes-section">
                <h3 className="quotes-section-title">Detalles</h3>
                <div className="quotes-grid">
                  <label className="quotes-field">
                    Titulo
                    <input
                      type="text"
                      value={formData.title}
                      onChange={handleFormFieldChange('title')}
                    />
                  </label>
                  <label className="quotes-field">
                    Fecha
                    <input
                      type="date"
                      value={formData.date}
                      onChange={handleFormFieldChange('date')}
                    />
                  </label>
                  <label className="quotes-field">
                    Cliente id
                    <input
                      type="number"
                      value={formData.clientId}
                      onChange={handleFormFieldChange('clientId')}
                    />
                  </label>
                  <label className="quotes-field">
                    Estado
                    <select
                      value={formData.status}
                      onChange={handleFormFieldChange('status')}
                    >
                      {quoteStatuses.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="quotes-field">
                    Tipo producto
                    <select
                      value={formData.productType}
                      onChange={handleFormFieldChange('productType')}
                    >
                      {productTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="quotes-field">
                    Editado por
                    <input
                      type="text"
                      value={formData.lastEditedByName}
                      onChange={handleFormFieldChange('lastEditedByName')}
                    />
                  </label>
                </div>
                <label className="quotes-field">
                  Descripcion
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={handleFormFieldChange('description')}
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
                      value={formData.version.subDescription}
                      onChange={handleVersionFieldChange('subDescription')}
                    />
                  </label>
                  <label className="quotes-field">
                    Numero version
                    <input
                      type="number"
                      value={formData.version.versionNumber}
                      onChange={handleVersionFieldChange('versionNumber')}
                    />
                  </label>
                  <label className="quotes-field">
                    Margen (%)
                    <input
                      type="number"
                      value={formData.version.profitMargin}
                      onChange={handleVersionFieldChange('profitMargin')}
                    />
                  </label>
                  <label className="quotes-field">
                    Impuesto producto
                    <input
                      type="number"
                      value={formData.version.productTax}
                      onChange={handleVersionFieldChange('productTax')}
                    />
                  </label>
                  <label className="quotes-field">
                    Costo mano de obra
                    <input
                      type="number"
                      value={formData.version.laborCost}
                      onChange={handleVersionFieldChange('laborCost')}
                    />
                  </label>
                  <label className="quotes-field">
                    Descuento
                    <input
                      type="number"
                      value={formData.version.discount}
                      onChange={handleVersionFieldChange('discount')}
                    />
                  </label>
                  <label className="quotes-field">
                    Editado por (version)
                    <input
                      type="text"
                      value={formData.version.lastEditedByName}
                      onChange={handleVersionFieldChange('lastEditedByName')}
                    />
                  </label>
                </div>

                <div className="quotes-section-sub">
                  <div className="quotes-section-header">
                    <h4 className="quotes-section-title">Extras</h4>
                    <Button variant="secondary" size="sm" onClick={handleAddExtraCost}>
                      Agregar
                    </Button>
                  </div>
                  <div className="quotes-items">
                    {formData.version.extraCosts.map((item, index) => (
                      <div className="quotes-item-row" key={`extra-${index}`}>
                        <label className="quotes-field">
                          Tipo
                          <input
                            type="text"
                            value={item.type}
                            onChange={handleExtraCostChange(index, 'type')}
                          />
                        </label>
                        <label className="quotes-field">
                          Costo
                          <input
                            type="number"
                            value={item.cost}
                            onChange={handleExtraCostChange(index, 'cost')}
                          />
                        </label>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleRemoveExtraCost(index)}
                        >
                          Quitar
                        </Button>
                      </div>
                    ))}
                    {!formData.version.extraCosts.length && (
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
                  <Button variant="secondary" size="sm" onClick={handleAddSupply}>
                    Agregar
                  </Button>
                </div>
                <div className="quotes-items">
                  {formData.supplies.map((item, index) => (
                    <div className="quotes-item-row" key={`supply-${index}`}>
                      <label className="quotes-field">
                        Insumo
                        <select
                          value={item.suppliesId}
                          onChange={handleSupplyChange(index, 'suppliesId')}
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
                          onChange={handleSupplyChange(index, 'usageQuantity')}
                        />
                      </label>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleRemoveSupply(index)}
                      >
                        Quitar
                      </Button>
                    </div>
                  ))}
                  {!formData.supplies.length && (
                    <p className="quotes-empty">Sin insumos agregados.</p>
                  )}
                </div>
              </div>

              <div className="quotes-section">
                <div className="quotes-section-header">
                  <h3 className="quotes-section-title">Activos</h3>
                  <Button variant="secondary" size="sm" onClick={handleAddAsset}>
                    Agregar
                  </Button>
                </div>
                <div className="quotes-items">
                  {formData.assets.map((item, index) => (
                    <div className="quotes-item-row" key={`asset-${index}`}>
                      <label className="quotes-field">
                        Activo
                        <select
                          value={item.assetsId}
                          onChange={handleAssetChange(index, 'assetsId')}
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
                          onChange={handleAssetChange(index, 'usageQuantity')}
                        />
                      </label>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleRemoveAsset(index)}
                      >
                        Quitar
                      </Button>
                    </div>
                  ))}
                  {!formData.assets.length && (
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
                      setImageFiles(
                        event.target.files ? Array.from(event.target.files) : []
                      )
                    }
                  />
                </label>
                {!!formData.images.length && (
                  <div className="quotes-tags">
                    {formData.images.map((image) => (
                      <span className="quotes-tag" key={image}>
                        {image}
                        <button type="button" onClick={handleRemoveImage(image)}>
                          x
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {!!imagePreviews.length && (
                  <div className="quotes-image-grid">
                    {imagePreviews.map((preview) => (
                      <img
                        key={preview.url}
                        src={preview.url}
                        alt={preview.file.name}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="quotes-section">
                <h3 className="quotes-section-title">Acciones</h3>
                <label className="quotes-field">
                  Update id
                  <input
                    type="number"
                    value={updateId}
                    onChange={(event) => setUpdateId(event.target.value)}
                  />
                </label>
                <div className="quotes-actions">
                  <Button
                    variant="primary"
                    onClick={handleCreate}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Enviando...' : 'Crear'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleUpdate}
                    disabled={actionLoading}
                  >
                    Actualizar
                  </Button>
                </div>
                {payloadError && <p className="quotes-error">{payloadError}</p>}
                {actionMessage && <p className="quotes-helper">{actionMessage}</p>}
              </div>
            </div>
          </section>
        </>
      )}
    </section>
  )
}

export default Cotizaciones
