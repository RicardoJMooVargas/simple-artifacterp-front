import { useEffect, useMemo, useState } from 'react'
import {
  CheckCircle2,
  ClipboardList,
  PackagePlus,
  RefreshCcw,
  Truck,
} from 'lucide-react'
import { useSession } from '../auth/auth'
import { Button } from '../components/ui/button'
import { InventoryCatalogsService } from '../services/inventory/InventoryCatalogsService'
import { InventoryAssortmentsService } from '../services/inventory/InventoryAssortmentsService'

const toNumber = (value) =>
  value === '' || value === null || value === undefined ? 0 : Number(value)

const formatDateTime = (value) => {
  if (!value) {
    return '--'
  }
  try {
    return new Date(value).toLocaleString()
  } catch {
    return String(value)
  }
}

const statusLabels = {
  1: 'Pendiente',
  2: 'Entregado',
}

const supplyTypeOptions = [
  { value: 0, label: 'Indefinido' },
  { value: 1, label: 'Consumibles' },
  { value: 2, label: 'Accesorios' },
  { value: 3, label: 'Materia prima' },
]

const supplyColorOptions = [
  { value: 0, label: 'Indefinido' },
  { value: 1, label: 'Negro' },
  { value: 2, label: 'Blanco' },
  { value: 3, label: 'Gris' },
  { value: 4, label: 'Rojo' },
  { value: 5, label: 'Azul' },
  { value: 6, label: 'Verde' },
  { value: 7, label: 'Amarillo' },
  { value: 8, label: 'Naranja' },
  { value: 9, label: 'Morado' },
  { value: 10, label: 'Rosa' },
  { value: 11, label: 'Cafe' },
]

const getSupplyTypeLabel = (value) =>
  supplyTypeOptions.find((option) => option.value === Number(value))?.label ??
  String(value ?? '--')

const getSupplyColorLabel = (value) =>
  supplyColorOptions.find((option) => option.value === Number(value))?.label ??
  String(value ?? '--')

const emptyDirectForm = {
  suppliesId: '',
  availableQuantity: '',
  minimumQuantity: '',
  committedQuantity: '',
  unitsMeasurementId: '',
  lastCost: '',
  lastEditedByName: '',
}

const emptyAssortmentForm = {
  suppliesId: '',
  isPack: false,
  packQuantity: '',
  purchaseQuantity: '',
  unitaryPurchaseCost: '',
  immediateDelivery: false,
  deliveryDate: '',
  lastEditedByName: '',
}

function Inventario() {
  const { session } = useSession()
  const displayName = session?.user?.name ?? 'Invitado'
  const [activeTab, setActiveTab] = useState('inventory')
  const [inventorySupplies, setInventorySupplies] = useState([])
  const [assortments, setAssortments] = useState([])
  const [supplies, setSupplies] = useState([])
  const [unitsMeasurement, setUnitsMeasurement] = useState([])
  const [inventoryLoading, setInventoryLoading] = useState(false)
  const [assortmentsLoading, setAssortmentsLoading] = useState(false)
  const [inventoryError, setInventoryError] = useState('')
  const [assortmentsError, setAssortmentsError] = useState('')
  const [assortmentFilters, setAssortmentFilters] = useState({
    status: '1',
    supplyType: '',
    month: '',
    year: '',
  })
  const [selectedInventoryId, setSelectedInventoryId] = useState(null)
  const [selectedAssortmentId, setSelectedAssortmentId] = useState(null)
  const [directModalOpen, setDirectModalOpen] = useState(false)
  const [assortmentModalOpen, setAssortmentModalOpen] = useState(false)
  const [finalizeModal, setFinalizeModal] = useState({
    isOpen: false,
    assortment: null,
  })
  const [directForm, setDirectForm] = useState(() => ({
    ...emptyDirectForm,
    lastEditedByName: displayName,
  }))
  const [assortmentForm, setAssortmentForm] = useState(() => ({
    ...emptyAssortmentForm,
    lastEditedByName: displayName,
  }))
  const [finalizeName, setFinalizeName] = useState(displayName)
  const [savingDirect, setSavingDirect] = useState(false)
  const [savingAssortment, setSavingAssortment] = useState(false)
  const [savingFinalize, setSavingFinalize] = useState(false)

  const inventorySelection = useMemo(
    () =>
      inventorySupplies.find(
        (item) => item.inventorySuppliesId === selectedInventoryId
      ),
    [inventorySupplies, selectedInventoryId]
  )

  const assortmentSelection = useMemo(
    () =>
      assortments.find((item) => item.assortmentId === selectedAssortmentId),
    [assortments, selectedAssortmentId]
  )

  useEffect(() => {
    void loadInventorySupplies()
    void loadSupplies()
    void loadUnitsMeasurement()
  }, [])

  useEffect(() => {
    if (activeTab === 'assortments') {
      void loadAssortments()
    }
  }, [activeTab])

  useEffect(() => {
    if (activeTab === 'assortments') {
      void loadAssortments()
    }
  }, [activeTab, assortmentFilters])

  useEffect(() => {
    setDirectForm((prev) => ({
      ...prev,
      lastEditedByName: displayName,
    }))
    setAssortmentForm((prev) => ({
      ...prev,
      lastEditedByName: displayName,
    }))
    setFinalizeName(displayName)
  }, [displayName])

  const loadInventorySupplies = async () => {
    setInventoryLoading(true)
    setInventoryError('')
    try {
      const data = await InventoryAssortmentsService.listInventorySupplies()
      setInventorySupplies(Array.isArray(data) ? data : [])
    } catch (error) {
      setInventoryError(error?.message ?? 'Error al cargar inventario')
    } finally {
      setInventoryLoading(false)
    }
  }

  const loadAssortments = async () => {
    setAssortmentsLoading(true)
    setAssortmentsError('')
    try {
      const query = {
        status:
          assortmentFilters.status === ''
            ? undefined
            : Number(assortmentFilters.status),
        supplyType:
          assortmentFilters.supplyType === ''
            ? undefined
            : Number(assortmentFilters.supplyType),
        month:
          assortmentFilters.month === ''
            ? undefined
            : Number(assortmentFilters.month),
        year:
          assortmentFilters.year === ''
            ? undefined
            : Number(assortmentFilters.year),
      }
      const data = await InventoryAssortmentsService.listAssortments(query)
      setAssortments(Array.isArray(data) ? data : [])
    } catch (error) {
      setAssortmentsError(error?.message ?? 'Error al cargar surtidos')
    } finally {
      setAssortmentsLoading(false)
    }
  }

  const loadSupplies = async () => {
    try {
      const data = await InventoryCatalogsService.listSupplies()
      setSupplies(Array.isArray(data) ? data : [])
    } catch {
      setSupplies([])
    }
  }

  const loadUnitsMeasurement = async () => {
    try {
      const data = await InventoryCatalogsService.listUnitsMeasurement()
      setUnitsMeasurement(Array.isArray(data) ? data : [])
    } catch {
      setUnitsMeasurement([])
    }
  }

  const resetDirectForm = () => {
    setDirectForm({
      ...emptyDirectForm,
      lastEditedByName: displayName,
    })
  }

  const resetAssortmentForm = () => {
    setAssortmentForm({
      ...emptyAssortmentForm,
      lastEditedByName: displayName,
    })
  }

  const handleDirectSubmit = async (event) => {
    event.preventDefault()
    setSavingDirect(true)
    setInventoryError('')

    try {
      const payload = {
        suppliesId: directForm.suppliesId,
        availableQuantity: toNumber(directForm.availableQuantity),
        minimumQuantity: toNumber(directForm.minimumQuantity),
        committedQuantity: toNumber(directForm.committedQuantity),
        unitsMeasurementId: directForm.unitsMeasurementId,
        lastCost: toNumber(directForm.lastCost),
        lastEditedByName: directForm.lastEditedByName,
      }

      await InventoryAssortmentsService.createDirectInventory(payload)
      setDirectModalOpen(false)
      resetDirectForm()
      await loadInventorySupplies()
    } catch (error) {
      setInventoryError(error?.message ?? 'Error al crear alta directa')
    } finally {
      setSavingDirect(false)
    }
  }

  const handleAssortmentSubmit = async (event) => {
    event.preventDefault()
    setSavingAssortment(true)
    setAssortmentsError('')

    try {
      const payload = {
        suppliesId: assortmentForm.suppliesId,
        isPack: Boolean(assortmentForm.isPack),
        packQuantity: toNumber(assortmentForm.packQuantity),
        purchaseQuantity: toNumber(assortmentForm.purchaseQuantity),
        unitaryPurchaseCost: toNumber(assortmentForm.unitaryPurchaseCost),
        immediateDelivery: Boolean(assortmentForm.immediateDelivery),
        deliveryDate: assortmentForm.deliveryDate || null,
        lastEditedByName: assortmentForm.lastEditedByName,
      }

      await InventoryAssortmentsService.createAssortment(payload)
      setAssortmentModalOpen(false)
      resetAssortmentForm()
      await loadAssortments()
      await loadInventorySupplies()
    } catch (error) {
      setAssortmentsError(error?.message ?? 'Error al iniciar surtido')
    } finally {
      setSavingAssortment(false)
    }
  }

  const handleFinalizeSubmit = async (event) => {
    event.preventDefault()
    if (!finalizeModal.assortment?.assortmentId) {
      return
    }

    setSavingFinalize(true)
    setAssortmentsError('')

    try {
      await InventoryAssortmentsService.finalizeAssortment(
        finalizeModal.assortment.assortmentId,
        {
          lastEditedByName: finalizeName,
        }
      )
      setFinalizeModal({ isOpen: false, assortment: null })
      await loadAssortments()
      await loadInventorySupplies()
    } catch (error) {
      setAssortmentsError(error?.message ?? 'Error al finalizar surtido')
    } finally {
      setSavingFinalize(false)
    }
  }

  const handleRefresh = () => {
    if (activeTab === 'inventory') {
      void loadInventorySupplies()
    } else {
      void loadAssortments()
    }
  }

  const supplyOptions = useMemo(
    () => supplies.map((item) => ({ value: item.id, label: item.name })),
    [supplies]
  )

  const unitOptions = useMemo(
    () =>
      unitsMeasurement.map((item) => ({ value: item.id, label: item.name })),
    [unitsMeasurement]
  )

  return (
    <section className="inventory-page">
      <header className="inventory-header">
        <div>
          <p className="inventory-kicker">Inventario</p>
          <h2 className="inventory-title">Surtidos e inventario de insumos</h2>
          <p className="inventory-subtitle">
            Controla altas directas, surtidos pendientes y entregas.
          </p>
        </div>
        <div className="inventory-actions">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleRefresh}
            disabled={activeTab === 'inventory' ? inventoryLoading : assortmentsLoading}
          >
            <RefreshCcw size={16} />
            {activeTab === 'inventory'
              ? inventoryLoading
                ? 'Actualizando...'
                : 'Actualizar inventario'
              : assortmentsLoading
                ? 'Actualizando...'
                : 'Actualizar surtidos'}
          </Button>
        </div>
      </header>

      <div className="inventory-tabs">
        <button
          type="button"
          className={`inventory-tab${activeTab === 'inventory' ? ' is-active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          Inventario de insumos
        </button>
        <button
          type="button"
          className={`inventory-tab${activeTab === 'assortments' ? ' is-active' : ''}`}
          onClick={() => setActiveTab('assortments')}
        >
          Surtidos
        </button>
      </div>

      {activeTab === 'inventory' ? (
        <div className="inventory-panel">
          <div className="inventory-toolbar">
            <div>
              <h3>Tabla de inventario</h3>
              <p>Selecciona un registro para ver detalles adicionales.</p>
            </div>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => {
                resetDirectForm()
                setDirectModalOpen(true)
              }}
            >
              <PackagePlus size={16} />
              Alta directa de inventario de insumos
            </Button>
          </div>

          <div className="inventory-table">
            <div className="inventory-row is-header">
              <span>Insumo</span>
              <span>Disponible</span>
              <span>Minimo</span>
              <span>Comprometido</span>
              <span>Ultimo costo</span>
              <span>Unidad</span>
            </div>
            {inventorySupplies.length === 0 && !inventoryLoading ? (
              <div className="inventory-empty">Sin registros de inventario.</div>
            ) : (
              inventorySupplies.map((item) => {
                const supply = item.supply
                const isActive = item.inventorySuppliesId === selectedInventoryId
                const unitLabel =
                  unitOptions.find((unit) => unit.value === item.unitsMeasurementId)
                    ?.label ?? item.unitsMeasurementId

                return (
                  <button
                    type="button"
                    key={item.inventorySuppliesId}
                    className={`inventory-row${isActive ? ' is-active' : ''}`}
                    onClick={() =>
                      setSelectedInventoryId(
                        isActive ? null : item.inventorySuppliesId
                      )
                    }
                  >
                    <span>{supply?.name ?? item.suppliesId}</span>
                    <span>{item.availableQuantity}</span>
                    <span>{item.minimumQuantity}</span>
                    <span>{item.committedQuantity}</span>
                    <span>${supply?.lastCost ?? item.lastCost ?? 0}</span>
                    <span>{unitLabel}</span>
                  </button>
                )
              })
            )}
          </div>

          {inventoryError && <p className="inventory-error">{inventoryError}</p>}

          {inventorySelection && (
            <div className="inventory-details">
              <div>
                <h4>Detalle del insumo</h4>
                <p className="inventory-detail-title">
                  {inventorySelection.supply?.name ??
                    inventorySelection.suppliesId}
                </p>
                <p className="inventory-detail-subtitle">
                  {inventorySelection.supply?.description ||
                    'Sin descripcion registrada.'}
                </p>
              </div>
              <div className="inventory-detail-grid">
                <div>
                  <span>Marca</span>
                  <strong>{inventorySelection.supply?.brand ?? '--'}</strong>
                </div>
                <div>
                  <span>Tipo</span>
                  <strong>
                    {getSupplyTypeLabel(inventorySelection.supply?.type)}
                  </strong>
                </div>
                <div>
                  <span>Color</span>
                  <strong>
                    {getSupplyColorLabel(inventorySelection.supply?.color)}
                  </strong>
                </div>
                <div>
                  <span>Ultimo movimiento</span>
                  <strong>{inventorySelection.lastDispatchNumber ?? '--'}</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="inventory-panel">
          <div className="inventory-toolbar">
            <div>
              <h3>Tabla de surtidos</h3>
              <p>Controla la entrega de insumos y el estatus de surtidos.</p>
            </div>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => {
                resetAssortmentForm()
                setAssortmentModalOpen(true)
              }}
            >
              <Truck size={16} />
              Inicia un surtido
            </Button>
          </div>

          <div className="inventory-filters">
            <label className="crud-field">
              Estado
              <select
                value={assortmentFilters.status}
                onChange={(event) =>
                  setAssortmentFilters((prev) => ({
                    ...prev,
                    status: event.target.value,
                  }))
                }
              >
                <option value="">Todos</option>
                <option value="1">Pendiente</option>
                <option value="2">Entregado</option>
              </select>
            </label>
            <label className="crud-field">
              Tipo de insumo
              <select
                value={assortmentFilters.supplyType}
                onChange={(event) =>
                  setAssortmentFilters((prev) => ({
                    ...prev,
                    supplyType: event.target.value,
                  }))
                }
              >
                <option value="">Todos</option>
                {supplyTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="crud-field">
              Mes
              <input
                type="number"
                min="1"
                max="12"
                value={assortmentFilters.month}
                onChange={(event) =>
                  setAssortmentFilters((prev) => ({
                    ...prev,
                    month: event.target.value,
                  }))
                }
              />
            </label>
            <label className="crud-field">
              Anio
              <input
                type="number"
                min="2020"
                max="2100"
                value={assortmentFilters.year}
                onChange={(event) =>
                  setAssortmentFilters((prev) => ({
                    ...prev,
                    year: event.target.value,
                  }))
                }
              />
            </label>
          </div>

          <div className="inventory-table">
            <div className="inventory-row is-header">
              <span>Insumo</span>
              <span>Cantidad</span>
              <span>Costo unitario</span>
              <span>Estado</span>
              <span>Entrega</span>
              <span>Responsable</span>
            </div>
            {assortments.length === 0 && !assortmentsLoading ? (
              <div className="inventory-empty">Sin surtidos registrados.</div>
            ) : (
              assortments.map((item) => {
                const isActive = item.assortmentId === selectedAssortmentId
                const supplyName = item.supply?.name ?? item.suppliesId
                return (
                  <button
                    type="button"
                    key={item.assortmentId}
                    className={`inventory-row${isActive ? ' is-active' : ''}`}
                    onClick={() =>
                      setSelectedAssortmentId(isActive ? null : item.assortmentId)
                    }
                  >
                    <span>{supplyName}</span>
                    <span>
                      {item.purchaseQuantity}{' '}
                      {item.isPack ? `(${item.packQuantity}x)` : ''}
                    </span>
                    <span>${item.unitaryPurchaseCost}</span>
                    <span>{statusLabels[item.status] ?? item.status}</span>
                    <span>{formatDateTime(item.deliveryDate)}</span>
                    <span>{item.lastEditedByName ?? '--'}</span>
                  </button>
                )
              })
            )}
          </div>

          {assortmentsError && (
            <p className="inventory-error">{assortmentsError}</p>
          )}

          {assortmentSelection && (
            <div className="inventory-details">
              <div>
                <h4>Detalle del surtido</h4>
                <p className="inventory-detail-title">
                  {assortmentSelection.supply?.name ??
                    assortmentSelection.suppliesId}
                </p>
                <p className="inventory-detail-subtitle">
                  {assortmentSelection.supply?.description ||
                    'Sin descripcion registrada.'}
                </p>
              </div>
              <div className="inventory-detail-grid">
                <div>
                  <span>Estado</span>
                  <strong>
                    {statusLabels[assortmentSelection.status] ??
                      assortmentSelection.status}
                  </strong>
                </div>
                <div>
                  <span>Tipo</span>
                  <strong>
                    {getSupplyTypeLabel(assortmentSelection.supply?.type)}
                  </strong>
                </div>
                <div>
                  <span>Entrega</span>
                  <strong>{formatDateTime(assortmentSelection.deliveryDate)}</strong>
                </div>
                <div>
                  <span>Pack</span>
                  <strong>
                    {assortmentSelection.isPack
                      ? `Si (${assortmentSelection.packQuantity})`
                      : 'No'}
                  </strong>
                </div>
                <div>
                  <span>Costo total</span>
                  <strong>
                    ${assortmentSelection.unitaryPurchaseCost ?? 0}
                  </strong>
                </div>
              </div>
              {assortmentSelection.status === 1 && (
                <div className="inventory-detail-action">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() =>
                      setFinalizeModal({
                        isOpen: true,
                        assortment: assortmentSelection,
                      })
                    }
                  >
                    <CheckCircle2 size={16} />
                    Finaliza un surtido pendiente y aplica el inventario
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {directModalOpen && (
        <div
          className="inventory-modal"
          role="dialog"
          aria-modal="true"
          onClick={() => setDirectModalOpen(false)}
        >
          <div
            className="inventory-modal-content"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="inventory-modal-header">
              <ClipboardList size={18} />
              <h3>Alta directa de inventario</h3>
            </div>
            <form className="crud-form" onSubmit={handleDirectSubmit}>
              <div className="crud-grid-fields">
                <label className="crud-field">
                  Insumo
                  <select
                    value={directForm.suppliesId}
                    onChange={(event) =>
                      setDirectForm((prev) => ({
                        ...prev,
                        suppliesId: event.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">Selecciona un insumo</option>
                    {supplyOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="crud-field">
                  Cantidad disponible
                  <input
                    type="number"
                    min="0"
                    value={directForm.availableQuantity}
                    onChange={(event) =>
                      setDirectForm((prev) => ({
                        ...prev,
                        availableQuantity: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <label className="crud-field">
                  Cantidad minima
                  <input
                    type="number"
                    min="0"
                    value={directForm.minimumQuantity}
                    onChange={(event) =>
                      setDirectForm((prev) => ({
                        ...prev,
                        minimumQuantity: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className="crud-field">
                  Cantidad comprometida
                  <input
                    type="number"
                    min="0"
                    value={directForm.committedQuantity}
                    onChange={(event) =>
                      setDirectForm((prev) => ({
                        ...prev,
                        committedQuantity: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className="crud-field">
                  Unidad de medida
                  <select
                    value={directForm.unitsMeasurementId}
                    onChange={(event) =>
                      setDirectForm((prev) => ({
                        ...prev,
                        unitsMeasurementId: event.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">Selecciona unidad</option>
                    {unitOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="crud-field">
                  Ultimo costo
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={directForm.lastCost}
                    onChange={(event) =>
                      setDirectForm((prev) => ({
                        ...prev,
                        lastCost: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className="crud-field">
                  Responsable
                  <input
                    type="text"
                    value={directForm.lastEditedByName}
                    onChange={(event) =>
                      setDirectForm((prev) => ({
                        ...prev,
                        lastEditedByName: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>
              <div className="crud-form-actions">
                <Button type="submit" variant="primary" size="sm" disabled={savingDirect}>
                  {savingDirect ? 'Guardando...' : 'Guardar alta directa'}
                </Button>
                <button
                  type="button"
                  className="crud-secondary"
                  onClick={() => setDirectModalOpen(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {assortmentModalOpen && (
        <div
          className="inventory-modal"
          role="dialog"
          aria-modal="true"
          onClick={() => setAssortmentModalOpen(false)}
        >
          <div
            className="inventory-modal-content"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="inventory-modal-header">
              <Truck size={18} />
              <h3>Iniciar surtido</h3>
            </div>
            <form className="crud-form" onSubmit={handleAssortmentSubmit}>
              <div className="crud-grid-fields">
                <label className="crud-field">
                  Insumo
                  <select
                    value={assortmentForm.suppliesId}
                    onChange={(event) =>
                      setAssortmentForm((prev) => ({
                        ...prev,
                        suppliesId: event.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">Selecciona un insumo</option>
                    {supplyOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="crud-field">
                  Cantidad de compra
                  <input
                    type="number"
                    min="0"
                    value={assortmentForm.purchaseQuantity}
                    onChange={(event) =>
                      setAssortmentForm((prev) => ({
                        ...prev,
                        purchaseQuantity: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <label className="crud-field">
                  Costo unitario
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={assortmentForm.unitaryPurchaseCost}
                    onChange={(event) =>
                      setAssortmentForm((prev) => ({
                        ...prev,
                        unitaryPurchaseCost: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <label className="crud-field">
                  Entrega inmediata
                  <select
                    value={assortmentForm.immediateDelivery ? 'yes' : 'no'}
                    onChange={(event) =>
                      setAssortmentForm((prev) => ({
                        ...prev,
                        immediateDelivery: event.target.value === 'yes',
                      }))
                    }
                  >
                    <option value="no">No</option>
                    <option value="yes">Si</option>
                  </select>
                </label>
                <label className="crud-field">
                  Fecha de entrega
                  <input
                    type="datetime-local"
                    value={assortmentForm.deliveryDate}
                    onChange={(event) =>
                      setAssortmentForm((prev) => ({
                        ...prev,
                        deliveryDate: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className="crud-field">
                  Es pack
                  <select
                    value={assortmentForm.isPack ? 'yes' : 'no'}
                    onChange={(event) =>
                      setAssortmentForm((prev) => ({
                        ...prev,
                        isPack: event.target.value === 'yes',
                      }))
                    }
                  >
                    <option value="no">No</option>
                    <option value="yes">Si</option>
                  </select>
                </label>
                <label className="crud-field">
                  Cantidad por pack
                  <input
                    type="number"
                    min="0"
                    value={assortmentForm.packQuantity}
                    onChange={(event) =>
                      setAssortmentForm((prev) => ({
                        ...prev,
                        packQuantity: event.target.value,
                      }))
                    }
                    disabled={!assortmentForm.isPack}
                  />
                </label>
                <label className="crud-field">
                  Responsable
                  <input
                    type="text"
                    value={assortmentForm.lastEditedByName}
                    onChange={(event) =>
                      setAssortmentForm((prev) => ({
                        ...prev,
                        lastEditedByName: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>
              <div className="crud-form-actions">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={savingAssortment}
                >
                  {savingAssortment ? 'Guardando...' : 'Guardar surtido'}
                </Button>
                <button
                  type="button"
                  className="crud-secondary"
                  onClick={() => setAssortmentModalOpen(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {finalizeModal.isOpen && (
        <div
          className="inventory-modal"
          role="dialog"
          aria-modal="true"
          onClick={() => setFinalizeModal({ isOpen: false, assortment: null })}
        >
          <div
            className="inventory-modal-content"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="inventory-modal-header">
              <CheckCircle2 size={18} />
              <h3>Finalizar surtido</h3>
            </div>
            <form className="crud-form" onSubmit={handleFinalizeSubmit}>
              <label className="crud-field">
                Responsable
                <input
                  type="text"
                  value={finalizeName}
                  onChange={(event) => setFinalizeName(event.target.value)}
                />
              </label>
              <div className="crud-form-actions">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={savingFinalize}
                >
                  {savingFinalize ? 'Finalizando...' : 'Finalizar surtido'}
                </Button>
                <button
                  type="button"
                  className="crud-secondary"
                  onClick={() =>
                    setFinalizeModal({ isOpen: false, assortment: null })
                  }
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

export default Inventario
