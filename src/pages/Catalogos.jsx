import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  Boxes,
  Package,
  RefreshCcw,
  Ruler,
  Warehouse,
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { InventoryCatalogsService } from '../services/inventory/InventoryCatalogsService'

const toNumber = (value) => (value === '' || value === null ? 0 : Number(value))

const emptyAssetForm = {
  name: '',
  description: '',
  price: '',
  imageFile: null,
  electricity: '',
  wearType: '',
}

const emptySupplyForm = {
  type: 0,
  name: '',
  color: 0,
  brand: '',
  imageFile: null,
  lastCost: '',
  costQuantity: '',
  unitCost: '',
  description: '',
  isActive: true,
  tax: '',
  unitsMeasurementId: '',
}

const emptyUnitMeasurementForm = {
  name: '',
  symbol: '',
  type: '',
}

function Catalogos() {
  const [view, setView] = useState('dashboard')
  const [assets, setAssets] = useState([])
  const [supplies, setSupplies] = useState([])
  const [assetsLoading, setAssetsLoading] = useState(false)
  const [suppliesLoading, setSuppliesLoading] = useState(false)
  const [unitsLoading, setUnitsLoading] = useState(false)
  const [assetsError, setAssetsError] = useState('')
  const [suppliesError, setSuppliesError] = useState('')
  const [unitsError, setUnitsError] = useState('')
  const [assetForm, setAssetForm] = useState(emptyAssetForm)
  const [supplyForm, setSupplyForm] = useState(emptySupplyForm)
  const [unitMeasurementForm, setUnitMeasurementForm] =
    useState(emptyUnitMeasurementForm)
  const [assetEditingId, setAssetEditingId] = useState(null)
  const [supplyEditingId, setSupplyEditingId] = useState(null)
  const [unitEditingId, setUnitEditingId] = useState(null)
  const [savingAsset, setSavingAsset] = useState(false)
  const [savingSupply, setSavingSupply] = useState(false)
  const [savingUnit, setSavingUnit] = useState(false)
  const [uploadingSupplyImage, setUploadingSupplyImage] = useState(false)
  const [supplyImageFile, setSupplyImageFile] = useState(null)
  const [supplyImagePreview, setSupplyImagePreview] = useState('')
  const [assetImageFile, setAssetImageFile] = useState(null)
  const [assetImagePreview, setAssetImagePreview] = useState('')
  const [imageModal, setImageModal] = useState({
    isOpen: false,
    src: '',
    alt: '',
  })
  const [unitsMeasurement, setUnitsMeasurement] = useState([])

  const supplyTypeOptions = useMemo(
    () => [
      { value: 0, label: 'Indefinido' },
      { value: 1, label: 'Consumibles' },
      { value: 2, label: 'Accesorios' },
      { value: 3, label: 'Materia prima' },
    ],
    []
  )

  const supplyColorOptions = useMemo(
    () => [
      { value: 0, label: 'Indefinido', hex: 'transparent' },
      { value: 1, label: 'Negro', hex: '#000000' },
      { value: 2, label: 'Blanco', hex: '#FFFFFF' },
      { value: 3, label: 'Gris', hex: '#808080' },
      { value: 4, label: 'Rojo', hex: '#FF0000' },
      { value: 5, label: 'Azul', hex: '#0000FF' },
      { value: 6, label: 'Verde', hex: '#008000' },
      { value: 7, label: 'Amarillo', hex: '#FFFF00' },
      { value: 8, label: 'Naranja', hex: '#FFA500' },
      { value: 9, label: 'Morado', hex: '#800080' },
      { value: 10, label: 'Rosa', hex: '#FFC0CB' },
      { value: 11, label: 'Cafe', hex: '#A52A2A' },
    ],
    []
  )

  const getSupplyTypeLabel = (value) =>
    supplyTypeOptions.find((option) => option.value === Number(value))
      ?.label ?? String(value ?? '')

  const getSupplyColorLabel = (value) =>
    supplyColorOptions.find((option) => option.value === Number(value))
      ?.label ?? String(value ?? '')

  const getSupplyColorMeta = (value) =>
    supplyColorOptions.find((option) => option.value === Number(value))

  const inventoryCatalogs = useMemo(
    () => [
      {
        key: 'assets',
        name: 'Assets',
        description: 'Activos fisicos y consumibles.',
        icon: Boxes,
      },
      {
        key: 'supplies',
        name: 'Insumos',
        description: 'Insumos y materiales de uso interno.',
        icon: Package,
      },
      {
        key: 'units',
        name: 'Unidades de medida',
        description: 'Configura unidades para insumos.',
        icon: Ruler,
      },
    ],
    []
  )

  useEffect(() => {
    if (view === 'assets') {
      void loadAssets()
    }
    if (view === 'supplies') {
      void loadSupplies()
      void loadUnitsMeasurement()
    }
    if (view === 'units') {
      void loadUnitsMeasurement()
    }
  }, [view])

  useEffect(() => {
    if (!supplyImageFile) {
      setSupplyImagePreview('')
      return undefined
    }

    const objectUrl = URL.createObjectURL(supplyImageFile)
    setSupplyImagePreview(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [supplyImageFile])

  useEffect(() => {
    if (!assetImageFile) {
      setAssetImagePreview('')
      return undefined
    }

    const objectUrl = URL.createObjectURL(assetImageFile)
    setAssetImagePreview(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [assetImageFile])

  const loadAssets = async () => {
    setAssetsLoading(true)
    setAssetsError('')
    try {
      const data = await InventoryCatalogsService.listAssets()
      setAssets(Array.isArray(data) ? data : [])
    } catch (error) {
      setAssetsError(error?.message ?? 'Error al cargar assets')
    } finally {
      setAssetsLoading(false)
    }
  }

  const loadSupplies = async () => {
    setSuppliesLoading(true)
    setSuppliesError('')
    try {
      const data = await InventoryCatalogsService.listSupplies()
      setSupplies(Array.isArray(data) ? data : [])
    } catch (error) {
      setSuppliesError(error?.message ?? 'Error al cargar insumos')
    } finally {
      setSuppliesLoading(false)
    }
  }

  const loadUnitsMeasurement = async () => {
    setUnitsLoading(true)
    setUnitsError('')
    try {
      const data = await InventoryCatalogsService.listUnitsMeasurement()
      setUnitsMeasurement(Array.isArray(data) ? data : [])
    } catch (error) {
      setUnitsError(error?.message ?? 'Error al cargar unidades')
    } finally {
      setUnitsLoading(false)
    }
  }

  const handleAssetSubmit = async (event) => {
    event.preventDefault()
    setSavingAsset(true)
    try {
      const payload = {
        ...assetForm,
        price: toNumber(assetForm.price),
        electricity: toNumber(assetForm.electricity),
        wearType: toNumber(assetForm.wearType),
      }

      if (assetEditingId) {
        delete payload.imageFile
        await InventoryCatalogsService.updateAsset(assetEditingId, payload)
      } else {
        await InventoryCatalogsService.createAsset(payload)
      }

      setAssetForm(emptyAssetForm)
      setAssetEditingId(null)
      setAssetImageFile(null)
      await loadAssets()
    } catch (error) {
      setAssetsError(error?.message ?? 'Error al guardar asset')
    } finally {
      setSavingAsset(false)
    }
  }

  const handleSupplySubmit = async (event) => {
    event.preventDefault()
    setSavingSupply(true)
    try {
      const payload = {
        ...supplyForm,
        type: toNumber(supplyForm.type),
        color: toNumber(supplyForm.color),
        lastCost: toNumber(supplyForm.lastCost),
        costQuantity: toNumber(supplyForm.costQuantity),
        unitCost: toNumber(supplyForm.unitCost),
        tax: toNumber(supplyForm.tax),
        unitsMeasurementId: supplyForm.unitsMeasurementId,
      }

      if (supplyEditingId) {
        delete payload.imageFile
        await InventoryCatalogsService.updateSupply(supplyEditingId, payload)
      } else {
        await InventoryCatalogsService.createSupply(payload)
      }

      setSupplyForm(emptySupplyForm)
      setSupplyEditingId(null)
      setSupplyImageFile(null)
      await loadSupplies()
    } catch (error) {
      setSuppliesError(error?.message ?? 'Error al guardar insumo')
    } finally {
      setSavingSupply(false)
    }
  }

  const handleUnitMeasurementSubmit = async (event) => {
    event.preventDefault()
    setSavingUnit(true)
    try {
      if (unitEditingId) {
        await InventoryCatalogsService.updateUnitMeasurement(
          unitEditingId,
          unitMeasurementForm
        )
      } else {
        await InventoryCatalogsService.createUnitMeasurement(
          unitMeasurementForm
        )
      }

      setUnitMeasurementForm(emptyUnitMeasurementForm)
      setUnitEditingId(null)
      await loadUnitsMeasurement()
    } catch (error) {
      setUnitsError(error?.message ?? 'Error al guardar unidad')
    } finally {
      setSavingUnit(false)
    }
  }

  const handleAssetEdit = (asset) => {
    setAssetEditingId(asset.id)
    setAssetForm({
      name: asset.name ?? '',
      description: asset.description ?? '',
      price: asset.price ?? '',
      imageFile: null,
      electricity: asset.electricity ?? '',
      wearType: asset.wearType ?? '',
    })
    setAssetImageFile(null)
  }

  const handleSupplyEdit = (supply) => {
    setSupplyEditingId(supply.id)
    setSupplyForm({
      type: supply.type ?? 0,
      name: supply.name ?? '',
      color: supply.color ?? 0,
      brand: supply.brand ?? '',
      imageFile: null,
      lastCost: supply.lastCost ?? '',
      costQuantity: supply.costQuantity ?? '',
      unitCost: supply.unitCost ?? '',
      description: supply.description ?? '',
      isActive: Boolean(supply.isActive),
      tax: supply.tax ?? '',
      unitsMeasurementId: supply.unitsMeasurementId ?? '',
    })
    setSupplyImageFile(null)
  }

  const handleUnitMeasurementEdit = (unit) => {
    setUnitEditingId(unit.id)
    setUnitMeasurementForm({
      name: unit.name ?? '',
      symbol: unit.symbol ?? '',
      type: unit.type ?? '',
    })
  }

  const handleAssetDelete = async (id) => {
    try {
      await InventoryCatalogsService.deleteAsset(id, false)
      await loadAssets()
    } catch (error) {
      setAssetsError(error?.message ?? 'Error al eliminar asset')
    }
  }

  const handleSupplyDelete = async (id) => {
    try {
      await InventoryCatalogsService.deleteSupply(id, false)
      await loadSupplies()
    } catch (error) {
      setSuppliesError(error?.message ?? 'Error al eliminar insumo')
    }
  }

  const handleUnitMeasurementDelete = async (id) => {
    try {
      await InventoryCatalogsService.deleteUnitMeasurement(id, false)
      await loadUnitsMeasurement()
    } catch (error) {
      setUnitsError(error?.message ?? 'Error al eliminar unidad')
    }
  }

  const handleSupplyImageUpload = async () => {
    if (!supplyEditingId || !supplyImageFile) {
      return
    }

    setUploadingSupplyImage(true)
    try {
      await InventoryCatalogsService.uploadSupplyImage(
        supplyEditingId,
        supplyImageFile
      )
      setSupplyImageFile(null)
      await loadSupplies()
    } catch (error) {
      setSuppliesError(error?.message ?? 'Error al subir imagen')
    } finally {
      setUploadingSupplyImage(false)
    }
  }

  const renderDashboard = () => (
    <div className="catalog-dashboard">
      <div className="catalog-header">
        <div>
          <p className="catalog-kicker">Modulo activo</p>
          <h2 className="catalog-title">Inventario</h2>
          <p className="catalog-subtitle">
            Selecciona un catalogo para administrar su CRUD.
          </p>
        </div>
        <div className="catalog-chip">
          <Warehouse size={18} />
          <span>Inventario</span>
        </div>
      </div>
      <div className="catalog-grid">
        {inventoryCatalogs.map((catalog) => {
          const Icon = catalog.icon
          return (
            <button
              key={catalog.key}
              type="button"
              className="catalog-card module-inventory"
              onClick={() => setView(catalog.key)}
            >
              <div className="catalog-card-icon">
                <Icon size={24} />
              </div>
              <div>
                <p className="catalog-card-module">Inventario</p>
                <h3 className="catalog-card-title">{catalog.name}</h3>
                <p className="catalog-card-desc">{catalog.description}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )

  const renderAssetsCrud = () => (
    <div className="catalog-crud">
      <div className="catalog-toolbar">
        <button
          type="button"
          className="catalog-back"
          onClick={() => setView('dashboard')}
        >
          <ArrowLeft size={18} />
          <span>Volver</span>
        </button>
        <div>
          <h2 className="catalog-title">Assets</h2>
          <p className="catalog-subtitle">CRUD de activos del inventario.</p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => loadAssets()}
          className="catalog-refresh"
        >
          <RefreshCcw size={16} />
          Actualizar
        </Button>
      </div>
      <div className="crud-grid">
        <div className="crud-panel">
          <div className="crud-panel-header">
            <h3 className="crud-title">Listado</h3>
            {assetsLoading && <span className="crud-status">Cargando...</span>}
            {assetsError && <span className="crud-error">{assetsError}</span>}
          </div>
          <div className="crud-table">
            <div className="crud-row crud-head">
              <span>Nombre</span>
              <span>Imagen</span>
              <span>Precio</span>
              <span>Electricidad</span>
              <span>Desgaste</span>
              <span>Acciones</span>
            </div>
            {assets.map((asset) => (
              <div className="crud-row" key={asset.id}>
                <span>{asset.name || 'Sin nombre'}</span>
                <span>
                  {asset.image ? (
                    <button
                      type="button"
                      className="image-thumb"
                      onClick={() =>
                        setImageModal({
                          isOpen: true,
                          src: asset.image,
                          alt: asset.name || 'Activo',
                        })
                      }
                    >
                      <img
                        className="image-thumb-img"
                        src={asset.image}
                        alt={asset.name || 'Activo'}
                      />
                    </button>
                  ) : (
                    <span className="image-empty">Sin imagen</span>
                  )}
                </span>
                <span>{asset.price}</span>
                <span>{asset.electricity}</span>
                <span>{asset.wearType}</span>
                <span className="crud-actions">
                  <button
                    type="button"
                    className="crud-link"
                    onClick={() => handleAssetEdit(asset)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="crud-link is-danger"
                    onClick={() => handleAssetDelete(asset.id)}
                  >
                    Eliminar
                  </button>
                </span>
              </div>
            ))}
            {!assetsLoading && assets.length === 0 && (
              <div className="crud-empty">Sin registros.</div>
            )}
          </div>
        </div>
        <div className="crud-panel">
          <div className="crud-panel-header">
            <h3 className="crud-title">
              {assetEditingId ? 'Editar asset' : 'Nuevo asset'}
            </h3>
          </div>
          <form className="crud-form" onSubmit={handleAssetSubmit}>
            <label className="crud-field">
              Nombre
              <input
                value={assetForm.name}
                onChange={(event) =>
                  setAssetForm((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
              />
            </label>
            <label className="crud-field">
              Descripcion
              <input
                value={assetForm.description}
                onChange={(event) =>
                  setAssetForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
              />
            </label>
            <label className="crud-field">
              Precio
              <input
                type="number"
                value={assetForm.price}
                onChange={(event) =>
                  setAssetForm((prev) => ({
                    ...prev,
                    price: event.target.value,
                  }))
                }
              />
            </label>
            <label className="crud-field">
              Imagen (archivo)
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const nextFile = event.target.files?.[0] ?? null
                  setAssetForm((prev) => ({
                    ...prev,
                    imageFile: nextFile,
                  }))
                  setAssetImageFile(nextFile)
                }}
              />
            </label>
            {assetImagePreview && (
              <div className="image-preview">
                <img src={assetImagePreview} alt="Vista previa" />
              </div>
            )}
            <label className="crud-field">
              Electricidad
              <input
                type="number"
                value={assetForm.electricity}
                onChange={(event) =>
                  setAssetForm((prev) => ({
                    ...prev,
                    electricity: event.target.value,
                  }))
                }
              />
            </label>
            <label className="crud-field">
              Desgaste
              <input
                type="number"
                value={assetForm.wearType}
                onChange={(event) =>
                  setAssetForm((prev) => ({
                    ...prev,
                    wearType: event.target.value,
                  }))
                }
              />
            </label>
            <div className="crud-form-actions">
              <Button type="submit" size="sm" disabled={savingAsset}>
                {savingAsset ? 'Guardando...' : 'Guardar'}
              </Button>
              {assetEditingId && (
                <button
                  type="button"
                  className="crud-secondary"
                  onClick={() => {
                    setAssetEditingId(null)
                    setAssetForm(emptyAssetForm)
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )

  const renderSuppliesCrud = () => (
    <div className="catalog-crud">
      <div className="catalog-toolbar">
        <button
          type="button"
          className="catalog-back"
          onClick={() => setView('dashboard')}
        >
          <ArrowLeft size={18} />
          <span>Volver</span>
        </button>
        <div>
          <h2 className="catalog-title">Insumos</h2>
          <p className="catalog-subtitle">CRUD de insumos del inventario.</p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => loadSupplies()}
          className="catalog-refresh"
        >
          <RefreshCcw size={16} />
          Actualizar
        </Button>
      </div>
      <div className="crud-grid">
        <div className="crud-panel">
          <div className="crud-panel-header">
            <h3 className="crud-title">Listado</h3>
            {suppliesLoading && <span className="crud-status">Cargando...</span>}
            {suppliesError && <span className="crud-error">{suppliesError}</span>}
          </div>
          <div className="crud-table">
            <div className="crud-row crud-head">
              <span>Nombre</span>
              <span>Imagen</span>
              <span>Tipo / Color</span>
              <span>Cantidad costo</span>
              <span>Costo unitario</span>
              <span>Activo</span>
              <span>Unidad</span>
              <span>Acciones</span>
            </div>
            {supplies.map((supply) => (
              <div className="crud-row" key={supply.id}>
                <span>{supply.name || 'Sin nombre'}</span>
                <span>
                  {supply.image ? (
                    <button
                      type="button"
                      className="image-thumb"
                      onClick={() =>
                        setImageModal({
                          isOpen: true,
                          src: supply.image,
                          alt: supply.name || 'Insumo',
                        })
                      }
                    >
                      <img
                        className="image-thumb-img"
                        src={supply.image}
                        alt={supply.name || 'Insumo'}
                      />
                    </button>
                  ) : (
                    <span className="image-empty">Sin imagen</span>
                  )}
                </span>
                <span className="color-chip">
                  <span
                    className={`color-swatch${
                      getSupplyColorMeta(supply.color)?.hex === 'transparent'
                        ? ' is-empty'
                        : ''
                    }`}
                    style={{
                      backgroundColor:
                        getSupplyColorMeta(supply.color)?.hex ?? 'transparent',
                    }}
                  />
                  {getSupplyTypeLabel(supply.type)} / {getSupplyColorLabel(supply.color)}
                </span>
                <span>{supply.costQuantity ?? 0}</span>
                <span>{supply.unitCost ?? 0}</span>
                <span>{supply.isActive ? 'Si' : 'No'}</span>
                <span>
                  {unitsMeasurement.find(
                    (unit) => unit.id === supply.unitsMeasurementId
                  )?.name ?? supply.unitsMeasurementId}
                </span>
                <span className="crud-actions">
                  <button
                    type="button"
                    className="crud-link"
                    onClick={() => handleSupplyEdit(supply)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="crud-link is-danger"
                    onClick={() => handleSupplyDelete(supply.id)}
                  >
                    Eliminar
                  </button>
                </span>
              </div>
            ))}
            {!suppliesLoading && supplies.length === 0 && (
              <div className="crud-empty">Sin registros.</div>
            )}
          </div>
        </div>
        <div className="crud-panel">
          <div className="crud-panel-header">
            <h3 className="crud-title">
              {supplyEditingId ? 'Editar insumo' : 'Nuevo insumo'}
            </h3>
          </div>
          <form className="crud-form" onSubmit={handleSupplySubmit}>
            <div className="crud-grid-fields">
              <label className="crud-field">
                Tipo
                <select
                  value={supplyForm.type}
                  onChange={(event) =>
                    setSupplyForm((prev) => ({
                      ...prev,
                      type: event.target.value,
                    }))
                  }
                >
                  {supplyTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="crud-field">
                Nombre
                <input
                  value={supplyForm.name}
                  onChange={(event) =>
                    setSupplyForm((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="crud-field">
                Color
                <div className="crud-field-row">
                  <select
                    value={supplyForm.color}
                    onChange={(event) =>
                      setSupplyForm((prev) => ({
                        ...prev,
                        color: event.target.value,
                      }))
                    }
                  >
                    {supplyColorOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <span
                    className={`color-swatch${
                      getSupplyColorMeta(supplyForm.color)?.hex === 'transparent'
                        ? ' is-empty'
                        : ''
                    }`}
                    style={{
                      backgroundColor:
                        getSupplyColorMeta(supplyForm.color)?.hex ?? 'transparent',
                    }}
                  />
                </div>
              </label>
              <label className="crud-field">
                Marca
                <input
                  value={supplyForm.brand}
                  onChange={(event) =>
                    setSupplyForm((prev) => ({
                      ...prev,
                      brand: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="crud-field">
                Ultimo costo
                <input
                  type="number"
                  value={supplyForm.lastCost}
                  onChange={(event) =>
                    setSupplyForm((prev) => ({
                      ...prev,
                      lastCost: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="crud-field">
                Cantidad costo
                <input
                  type="number"
                  value={supplyForm.costQuantity}
                  onChange={(event) =>
                    setSupplyForm((prev) => ({
                      ...prev,
                      costQuantity: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="crud-field">
                Costo unitario
                <input
                  type="number"
                  value={supplyForm.unitCost}
                  onChange={(event) =>
                    setSupplyForm((prev) => ({
                      ...prev,
                      unitCost: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="crud-field">
                Descripcion
                <input
                  value={supplyForm.description}
                  onChange={(event) =>
                    setSupplyForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="crud-field">
                Activo
                <select
                  value={supplyForm.isActive ? 'true' : 'false'}
                  onChange={(event) =>
                    setSupplyForm((prev) => ({
                      ...prev,
                      isActive: event.target.value === 'true',
                    }))
                  }
                >
                  <option value="true">Si</option>
                  <option value="false">No</option>
                </select>
              </label>
              <label className="crud-field">
                Impuesto
                <input
                  type="number"
                  value={supplyForm.tax}
                  onChange={(event) =>
                    setSupplyForm((prev) => ({
                      ...prev,
                      tax: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="crud-field">
                Unidad
                <select
                  value={supplyForm.unitsMeasurementId}
                  onChange={(event) =>
                    setSupplyForm((prev) => ({
                      ...prev,
                      unitsMeasurementId: event.target.value,
                    }))
                  }
                >
                  <option value="">Selecciona una unidad</option>
                  {unitsMeasurement.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name} ({unit.symbol})
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="crud-field">
              Imagen (archivo)
              <input
                type="file"
                accept="image/*"
                onChange={(event) =>
                    {
                      const nextFile = event.target.files?.[0] ?? null
                      setSupplyForm((prev) => ({
                        ...prev,
                        imageFile: nextFile,
                      }))
                      setSupplyImageFile(nextFile)
                    }
                }
              />
            </label>
            {supplyImagePreview && (
              <div className="image-preview">
                <img src={supplyImagePreview} alt="Vista previa" />
              </div>
            )}
            <div className="crud-form-actions">
              <Button type="submit" size="sm" disabled={savingSupply}>
                {savingSupply ? 'Guardando...' : 'Guardar'}
              </Button>
              {supplyEditingId && (
                <button
                  type="button"
                  className="crud-secondary"
                  onClick={() => {
                    setSupplyEditingId(null)
                    setSupplyForm(emptySupplyForm)
                    setSupplyImageFile(null)
                  }}
                >
                  Cancelar
                </button>
              )}
              <button
                type="button"
                className="crud-secondary"
                disabled={!supplyEditingId || !supplyImageFile || uploadingSupplyImage}
                onClick={handleSupplyImageUpload}
              >
                {uploadingSupplyImage ? 'Subiendo...' : 'Subir imagen'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )

  const renderUnitsCrud = () => (
    <div className="catalog-crud">
      <div className="catalog-toolbar">
        <button
          type="button"
          className="catalog-back"
          onClick={() => setView('dashboard')}
        >
          <ArrowLeft size={18} />
          <span>Volver</span>
        </button>
        <div>
          <h2 className="catalog-title">Unidades de medida</h2>
          <p className="catalog-subtitle">
            CRUD de unidades para insumos.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => loadUnitsMeasurement()}
          className="catalog-refresh"
        >
          <RefreshCcw size={16} />
          Actualizar
        </Button>
      </div>
      <div className="crud-grid">
        <div className="crud-panel">
          <div className="crud-panel-header">
            <h3 className="crud-title">Listado</h3>
            {unitsLoading && <span className="crud-status">Cargando...</span>}
            {unitsError && <span className="crud-error">{unitsError}</span>}
          </div>
          <div className="crud-table">
            <div className="crud-row crud-head">
              <span>Nombre</span>
              <span>Simbolo</span>
              <span>Tipo</span>
              <span>Acciones</span>
            </div>
            {unitsMeasurement.map((unit) => (
              <div className="crud-row" key={unit.id}>
                <span>{unit.name || 'Sin nombre'}</span>
                <span>{unit.symbol}</span>
                <span>{unit.type}</span>
                <span className="crud-actions">
                  <button
                    type="button"
                    className="crud-link"
                    onClick={() => handleUnitMeasurementEdit(unit)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="crud-link is-danger"
                    onClick={() => handleUnitMeasurementDelete(unit.id)}
                  >
                    Eliminar
                  </button>
                </span>
              </div>
            ))}
            {!unitsLoading && unitsMeasurement.length === 0 && (
              <div className="crud-empty">Sin registros.</div>
            )}
          </div>
        </div>
        <div className="crud-panel">
          <div className="crud-panel-header">
            <h3 className="crud-title">
              {unitEditingId
                ? 'Editar unidad'
                : 'Nueva unidad'}
            </h3>
          </div>
          <form className="crud-form" onSubmit={handleUnitMeasurementSubmit}>
            <label className="crud-field">
              Nombre
              <input
                value={unitMeasurementForm.name}
                onChange={(event) =>
                  setUnitMeasurementForm((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
              />
            </label>
            <label className="crud-field">
              Simbolo
              <input
                value={unitMeasurementForm.symbol}
                onChange={(event) =>
                  setUnitMeasurementForm((prev) => ({
                    ...prev,
                    symbol: event.target.value,
                  }))
                }
              />
            </label>
            <label className="crud-field">
              Tipo
              <input
                value={unitMeasurementForm.type}
                onChange={(event) =>
                  setUnitMeasurementForm((prev) => ({
                    ...prev,
                    type: event.target.value,
                  }))
                }
              />
            </label>
            <div className="crud-form-actions">
              <Button type="submit" size="sm" disabled={savingUnit}>
                {savingUnit ? 'Guardando...' : 'Guardar'}
              </Button>
              {unitEditingId && (
                <button
                  type="button"
                  className="crud-secondary"
                  onClick={() => {
                    setUnitEditingId(null)
                    setUnitMeasurementForm(emptyUnitMeasurementForm)
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )

  return (
    <section className="catalog-page">
      {imageModal.isOpen && (
        <div
          className="image-modal"
          role="dialog"
          aria-modal="true"
          onClick={() =>
            setImageModal({
              isOpen: false,
              src: '',
              alt: '',
            })
          }
        >
          <div
            className="image-modal-content"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="image-modal-close"
              onClick={() =>
                setImageModal({
                  isOpen: false,
                  src: '',
                  alt: '',
                })
              }
            >
              Cerrar
            </button>
            <img src={imageModal.src} alt={imageModal.alt} />
          </div>
        </div>
      )}
      {view === 'dashboard' && renderDashboard()}
      {view === 'assets' && renderAssetsCrud()}
      {view === 'supplies' && renderSuppliesCrud()}
      {view === 'units' && renderUnitsCrud()}
    </section>
  )
}

export default Catalogos
