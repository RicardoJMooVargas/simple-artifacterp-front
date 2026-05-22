import { useEffect, useMemo, useState } from "react";
import { Button } from "../components/ui/button";
import { QuotationsService } from "../services/quotations/QuotationsService";
import { useSession } from "../auth/auth";

const emptyPayload = {
  title: "",
  date: new Date().toISOString(),
  clientId: 0,
  description: "",
  status: 0,
  productType: 0,
  images: [],
  lastEditedByName: "",
  version: {
    subDescription: "",
    versionNumber: 1,
    profitMargin: 0,
    extraCosts: [],
    productTax: 0,
    laborCost: 0,
    discount: 0,
    lastEditedByName: "",
  },
  supplies: [],
  assets: [],
};

const formatDate = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("es-MX");
};

const toDateInputValue = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
};

const toNumber = (value) =>
  value === "" || value === null || value === undefined ? 0 : Number(value);

function Cotizaciones() {
  const { session } = useSession();
  const sessionUserName =
    session?.user?.name ||
    session?.user?.userName ||
    session?.userName ||
    "Invitado";
  const [activeTab, setActiveTab] = useState("listado");
  const [filters, setFilters] = useState({
    year: "",
    month: "",
    productType: "",
    status: "",
    search: "",
  });
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [contextId, setContextId] = useState("");
  const [contextLoading, setContextLoading] = useState(false);
  const [contextError, setContextError] = useState("");
  const [contextData, setContextData] = useState(null);
  const [formData, setFormData] = useState({
    ...emptyPayload,
    date: toDateInputValue(emptyPayload.date),
  });
  const [payloadError, setPayloadError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [updateId, setUpdateId] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editContextId, setEditContextId] = useState("");
  const [editContextLoading, setEditContextLoading] = useState(false);
  const [editContextError, setEditContextError] = useState("");
  const [editContextData, setEditContextData] = useState(null);
  const [editFormData, setEditFormData] = useState({
    ...emptyPayload,
    date: toDateInputValue(emptyPayload.date),
  });
  const [editPayloadError, setEditPayloadError] = useState("");
  const [editActionLoading, setEditActionLoading] = useState(false);
  const [editActionMessage, setEditActionMessage] = useState("");
  const [editImageFiles, setEditImageFiles] = useState([]);
  const [editImagePreviews, setEditImagePreviews] = useState([]);
  const [editUpdateId, setEditUpdateId] = useState("");

  const createInitialDraft = () => ({
    ...emptyPayload,
    date: toDateInputValue(new Date().toISOString()),
    lastEditedByName: sessionUserName,
    version: {
      ...emptyPayload.version,
      lastEditedByName: sessionUserName,
    },
  });

  const applyQuotationToDraft = (response, setDraftFormData) => {
    const quotation = response?.quotation?.quotation;
    const version = response?.quotation?.version;

    if (!quotation) {
      setDraftFormData((current) => ({
        ...current,
        date: current.date || toDateInputValue(new Date().toISOString()),
        lastEditedByName: sessionUserName,
        version: {
          ...current.version,
          lastEditedByName: sessionUserName,
        },
      }));
      return;
    }

    setDraftFormData({
      title: quotation.title ?? "",
      date: toDateInputValue(quotation.date),
      clientId: quotation.clientId ?? 0,
      description: quotation.description ?? "",
      status: quotation.status ?? 0,
      productType: quotation.productType ?? 0,
      images: Array.isArray(quotation.images) ? quotation.images : [],
      lastEditedByName: quotation.lastEditedByName ?? sessionUserName,
      version: {
        subDescription: version?.subDescription ?? "",
        versionNumber: version?.versionNumber ?? 1,
        profitMargin: version?.profitMargin ?? 0,
        extraCosts: Array.isArray(version?.extraCosts)
          ? version.extraCosts
          : [],
        productTax: version?.productTax ?? 0,
        laborCost: version?.laborCost ?? 0,
        discount: version?.discount ?? 0,
        lastEditedByName: version?.lastEditedByName ?? sessionUserName,
      },
      supplies: Array.isArray(response?.quotation?.supplies)
        ? response.quotation.supplies.map((item) => ({
            suppliesId: item.suppliesId ?? "",
            usageQuantity: item.usageQuantity ?? 0,
          }))
        : [],
      assets: Array.isArray(response?.quotation?.assets)
        ? response.quotation.assets.map((item) => ({
            assetsId: item.assetsId ?? "",
            usageQuantity: item.usageQuantity ?? 0,
          }))
        : [],
    });
  };

  const filtersReady = useMemo(() => {
    if (!filters.year && !filters.month) {
      return true;
    }
    return Boolean(filters.year && filters.month);
  }, [filters.month, filters.year]);

  useEffect(() => {
    void loadQuotations();
  }, []);

  useEffect(() => {
    if (!imageFiles.length) {
      setImagePreviews([]);
      return undefined;
    }

    const previews = imageFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setImagePreviews(previews);

    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [imageFiles]);

  useEffect(() => {
    if (!editImageFiles.length) {
      setEditImagePreviews([]);
      return undefined;
    }

    const previews = editImageFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setEditImagePreviews(previews);

    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [editImageFiles]);

  const loadQuotations = async (overrideFilters) => {
    setLoading(true);
    setError("");

    try {
      const activeFilters = overrideFilters ?? filters;
      if (!filtersReady) {
        throw new Error("Debes enviar mes y anio para filtrar por fecha.");
      }

      const data = await QuotationsService.listQuotations({
        year: activeFilters.year || undefined,
        month: activeFilters.month || undefined,
        productType: activeFilters.productType || undefined,
        status: activeFilters.status || undefined,
        search: activeFilters.search || undefined,
      });
      setQuotations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message ?? "Error al cargar cotizaciones");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key) => (event) => {
    setFilters((current) => ({
      ...current,
      [key]: event.target.value,
    }));
  };

  const handleSearch = (event) => {
    event.preventDefault();
    void loadQuotations();
  };

  const resetFormState = () => {
    setContextId("");
    setUpdateId("");
    setContextData(null);
    setContextError("");
    setFormData(createInitialDraft());
    setPayloadError("");
    setActionMessage("");
    setImageFiles([]);
  };

  const handleLoadContext = async (useId) => {
    setContextLoading(true);
    setContextError("");
    setContextData(null);

    try {
      const idToUse = useId ?? contextId;
      const response = await QuotationsService.getContext(
        idToUse ? Number(idToUse) : undefined,
      );
      setContextData(response);
      applyQuotationToDraft(response, setFormData);
      if (response?.quotation?.quotation?.quotationId) {
        setUpdateId(String(response.quotation.quotation.quotationId));
      }
    } catch (err) {
      setContextError(err?.message ?? "Error al cargar contexto");
    } finally {
      setContextLoading(false);
    }
  };

  useEffect(() => {
    if (
      (activeTab === "crear" || activeTab === "contexto") &&
      !contextData &&
      !contextLoading
    ) {
      void handleLoadContext(contextId || "");
    }
  }, [activeTab]);

  useEffect(() => {
    document.body.classList.toggle("quotes-edit-modal-open", isEditModalOpen);
    window.dispatchEvent(
      new CustomEvent("quotes-edit-modal-toggle", {
        detail: { open: isEditModalOpen },
      }),
    );
    return () => {
      document.body.classList.remove("quotes-edit-modal-open");
      window.dispatchEvent(
        new CustomEvent("quotes-edit-modal-toggle", {
          detail: { open: false },
        }),
      );
    };
  }, [isEditModalOpen]);

  const handleLoadEditContext = async (useId) => {
    setEditContextLoading(true);
    setEditContextError("");
    setEditContextData(null);

    try {
      const idToUse = useId ?? editContextId;
      const response = await QuotationsService.getContext(
        idToUse ? Number(idToUse) : undefined,
      );
      setEditContextData(response);
      applyQuotationToDraft(response, setEditFormData);
      if (response?.quotation?.quotation?.quotationId) {
        const responseId = String(response.quotation.quotation.quotationId);
        setEditUpdateId(responseId);
        setEditContextId(responseId);
      }
    } catch (err) {
      setEditContextError(err?.message ?? "Error al cargar contexto");
    } finally {
      setEditContextLoading(false);
    }
  };

  const handleOpenNew = () => {
    resetFormState();
    setActiveTab("crear");
    void handleLoadContext("");
  };

  const handleOpenEdit = (quotationId) => {
    setEditContextId(String(quotationId));
    setEditUpdateId(String(quotationId));
    setEditContextError("");
    setEditPayloadError("");
    setEditActionMessage("");
    setEditImageFiles([]);
    setEditFormData(createInitialDraft());
    setIsEditModalOpen(true);
    void handleLoadEditContext(quotationId);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditPayloadError("");
    setEditActionMessage("");
  };

  const buildPayload = (draft, setDraftPayloadError) => {
    if (!draft.title) {
      setDraftPayloadError("El titulo es obligatorio.");
      return null;
    }

    setDraftPayloadError("");

    return {
      title: draft.title,
      date: draft.date
        ? new Date(draft.date).toISOString()
        : new Date().toISOString(),
      clientId: toNumber(draft.clientId),
      description: draft.description,
      status: toNumber(draft.status),
      productType: toNumber(draft.productType),
      images: Array.isArray(draft.images) ? draft.images : [],
      lastEditedByName: sessionUserName,
      version: {
        subDescription: draft.version.subDescription,
        versionNumber: toNumber(draft.version.versionNumber || 1),
        profitMargin: toNumber(draft.version.profitMargin),
        extraCosts: Array.isArray(draft.version.extraCosts)
          ? draft.version.extraCosts
              .filter((item) => item.type)
              .map((item) => ({
                type: item.type,
                cost: toNumber(item.cost),
              }))
          : [],
        productTax: toNumber(draft.version.productTax),
        laborCost: toNumber(draft.version.laborCost),
        discount: toNumber(draft.version.discount),
        lastEditedByName: sessionUserName,
      },
      supplies: Array.isArray(draft.supplies)
        ? draft.supplies
            .filter((item) => item.suppliesId)
            .map((item) => ({
              suppliesId: item.suppliesId,
              usageQuantity: toNumber(item.usageQuantity),
            }))
        : [],
      assets: Array.isArray(draft.assets)
        ? draft.assets
            .filter((item) => item.assetsId)
            .map((item) => ({
              assetsId: item.assetsId,
              usageQuantity: toNumber(item.usageQuantity),
            }))
        : [],
    };
  };

  const handleCreate = async () => {
    const payload = buildPayload(formData, setPayloadError);
    if (!payload) {
      return;
    }

    setActionLoading(true);
    setActionMessage("");
    try {
      await QuotationsService.createQuotation(payload, imageFiles);
      resetFormState();
      setActiveTab("listado");
      await loadQuotations();
    } catch (err) {
      setActionMessage(err?.message ?? "Error al crear cotizacion");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async () => {
    const payload = buildPayload(editFormData, setEditPayloadError);
    if (!payload) {
      return;
    }

    if (!editUpdateId) {
      setEditActionMessage("Ingresa un id para actualizar.");
      return;
    }

    setEditActionLoading(true);
    setEditActionMessage("");
    try {
      const response = await QuotationsService.updateQuotation(
        Number(editUpdateId),
        payload,
        editImageFiles,
      );
      setEditContextData(response);
      applyQuotationToDraft(response, setEditFormData);
      setIsEditModalOpen(false);
      await loadQuotations();
    } catch (err) {
      setEditActionMessage(err?.message ?? "Error al actualizar cotizacion");
    } finally {
      setEditActionLoading(false);
    }
  };

  const handleFormFieldChange = (setDraftFormData, field) => (event) => {
    setDraftFormData((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const handleVersionFieldChange = (setDraftFormData, field) => (event) => {
    setDraftFormData((current) => ({
      ...current,
      version: {
        ...current.version,
        [field]: event.target.value,
      },
    }));
  };

  const handleAddExtraCost = (setDraftFormData) => () => {
    setDraftFormData((current) => ({
      ...current,
      version: {
        ...current.version,
        extraCosts: [...current.version.extraCosts, { type: "", cost: "" }],
      },
    }));
  };

  const handleExtraCostChange = (setDraftFormData, index, field) => (event) => {
    const value = event.target.value;
    setDraftFormData((current) => ({
      ...current,
      version: {
        ...current.version,
        extraCosts: current.version.extraCosts.map((item, itemIndex) =>
          itemIndex === index ? { ...item, [field]: value } : item,
        ),
      },
    }));
  };

  const handleRemoveExtraCost = (setDraftFormData, index) => () => {
    setDraftFormData((current) => ({
      ...current,
      version: {
        ...current.version,
        extraCosts: current.version.extraCosts.filter(
          (_, itemIndex) => itemIndex !== index,
        ),
      },
    }));
  };

  const handleAddSupply = (setDraftFormData) => () => {
    setDraftFormData((current) => ({
      ...current,
      supplies: [...current.supplies, { suppliesId: "", usageQuantity: "" }],
    }));
  };

  const handleSupplyChange = (setDraftFormData, index, field) => (event) => {
    const value = event.target.value;
    setDraftFormData((current) => ({
      ...current,
      supplies: current.supplies.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const handleRemoveSupply = (setDraftFormData, index) => () => {
    setDraftFormData((current) => ({
      ...current,
      supplies: current.supplies.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleAddAsset = (setDraftFormData) => () => {
    setDraftFormData((current) => ({
      ...current,
      assets: [...current.assets, { assetsId: "", usageQuantity: "" }],
    }));
  };

  const handleAssetChange = (setDraftFormData, index, field) => (event) => {
    const value = event.target.value;
    setDraftFormData((current) => ({
      ...current,
      assets: current.assets.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const handleRemoveAsset = (setDraftFormData, index) => () => {
    setDraftFormData((current) => ({
      ...current,
      assets: current.assets.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleRemoveImage = (setDraftFormData, image) => () => {
    setDraftFormData((current) => ({
      ...current,
      images: current.images.filter((item) => item !== image),
    }));
  };

  const productTypesRaw =
    contextData?.productTypes ??
    contextData?.productsTypes ??
    contextData?.productTypeOptions ??
    [];
  const quoteStatusesRaw =
    contextData?.quoteStatuses ??
    contextData?.statuses ??
    contextData?.quoteStatus ??
    [];
  const productTypes = Array.isArray(productTypesRaw)
    ? productTypesRaw.map((type, index) => ({
        value: type?.value ?? type?.id ?? type?.key ?? index,
        name:
          type?.name ??
          type?.label ??
          type?.description ??
          String(type?.value ?? type?.id ?? type?.key ?? index),
      }))
    : [];
  const quoteStatuses = Array.isArray(quoteStatusesRaw)
    ? quoteStatusesRaw.map((status, index) => ({
        value: status?.value ?? status?.id ?? status?.key ?? index,
        name:
          status?.name ??
          status?.label ??
          status?.description ??
          String(status?.value ?? status?.id ?? status?.key ?? index),
      }))
    : [];
  const suppliesCatalog = contextData?.suppliesCatalog ?? [];
  const assetsCatalog = contextData?.assetsCatalog ?? [];
  const costBreakdown = contextData?.quotation?.costBreakdown;
  const currentSessionUser = sessionUserName || "-";

  const renderQuotationPanel = ({ isModal = false } = {}) => {
    const draftFormData = isModal ? editFormData : formData;
    const setDraftFormData = isModal ? setEditFormData : setFormData;
    const draftImageFiles = isModal ? editImageFiles : imageFiles;
    const setDraftImageFiles = isModal ? setEditImageFiles : setImageFiles;
    const draftImagePreviews = isModal ? editImagePreviews : imagePreviews;
    const draftPayloadError = isModal ? editPayloadError : payloadError;
    const draftActionMessage = isModal ? editActionMessage : actionMessage;
    const draftActionLoading = isModal ? editActionLoading : actionLoading;
    const draftUpdateId = isModal ? editUpdateId : updateId;
    const draftContextLoading = isModal ? editContextLoading : contextLoading;
    const draftContextError = isModal ? editContextError : contextError;

    return (
      <section className="quotes-panel">
        <div className="quotes-panel-header">
          <h2 className="quotes-panel-title">
            {isModal
              ? `Editar cotizacion ${draftUpdateId ? `#${draftUpdateId}` : ""}`
              : "Ingresa los datos de la cotización"}
          </h2>
          <div className="quotes-toolbar">
            {isModal && (
              <Button variant="secondary" onClick={handleCloseEditModal}>
                Cerrar
              </Button>
            )}
            <Button
              variant="primary"
              onClick={isModal ? handleUpdate : handleCreate}
              disabled={
                draftActionLoading ||
                (isModal && (!draftUpdateId || draftContextLoading))
              }
            >
              {draftActionLoading
                ? "Enviando..."
                : isModal
                  ? "Guardar cambios"
                  : "Crear cotización"}
            </Button>
          </div>
        </div>

        {isModal && draftContextLoading && (
          <p className="quotes-helper">Cargando datos de la cotizacion...</p>
        )}
        {isModal && draftContextError && (
          <p className="quotes-error">{draftContextError}</p>
        )}

        <div className="quotes-form-grid">
          <div className="quotes-section">
            <h3 className="quotes-section-title">Detalles</h3>
            <div className="quotes-grid">
              <label className="quotes-field">
                Titulo
                <input
                  type="text"
                  value={draftFormData.title}
                  onChange={handleFormFieldChange(setDraftFormData, "title")}
                />
              </label>
              <label className="quotes-field">
                Fecha
                <input
                  type="date"
                  value={draftFormData.date}
                  onChange={handleFormFieldChange(setDraftFormData, "date")}
                />
              </label>
              <label className="quotes-field">
                Estado
                <select
                  value={draftFormData.status}
                  onChange={handleFormFieldChange(setDraftFormData, "status")}
                >
                  {!quoteStatuses.length && (
                    <option value={draftFormData.status}>
                      Sin estados (carga contexto)
                    </option>
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
                <select
                  value={draftFormData.productType}
                  onChange={handleFormFieldChange(
                    setDraftFormData,
                    "productType",
                  )}
                >
                  {!productTypes.length && (
                    <option value={draftFormData.productType}>
                      Sin tipos (carga contexto)
                    </option>
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
                value={draftFormData.description}
                onChange={handleFormFieldChange(
                  setDraftFormData,
                  "description",
                )}
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
                  value={draftFormData.version.subDescription}
                  onChange={handleVersionFieldChange(
                    setDraftFormData,
                    "subDescription",
                  )}
                />
              </label>
              <label className="quotes-field">
                Numero version
                <input
                  type="number"
                  value={draftFormData.version.versionNumber}
                  onChange={handleVersionFieldChange(
                    setDraftFormData,
                    "versionNumber",
                  )}
                />
              </label>
              <label className="quotes-field">
                Margen (%)
                <input
                  type="number"
                  value={draftFormData.version.profitMargin}
                  onChange={handleVersionFieldChange(
                    setDraftFormData,
                    "profitMargin",
                  )}
                />
              </label>
              <label className="quotes-field">
                Impuesto producto
                <input
                  type="number"
                  value={draftFormData.version.productTax}
                  onChange={handleVersionFieldChange(
                    setDraftFormData,
                    "productTax",
                  )}
                />
              </label>
              <label className="quotes-field">
                Costo mano de obra
                <input
                  type="number"
                  value={draftFormData.version.laborCost}
                  onChange={handleVersionFieldChange(
                    setDraftFormData,
                    "laborCost",
                  )}
                />
              </label>
              <label className="quotes-field">
                Descuento
                <input
                  type="number"
                  value={draftFormData.version.discount}
                  onChange={handleVersionFieldChange(
                    setDraftFormData,
                    "discount",
                  )}
                />
              </label>
            </div>

            <div className="quotes-section-sub">
              <div className="quotes-section-header">
                <h4 className="quotes-section-title">Extras</h4>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleAddExtraCost(setDraftFormData)}
                >
                  Agregar
                </Button>
              </div>
              <div className="quotes-items">
                {draftFormData.version.extraCosts.map((item, index) => (
                  <div className="quotes-item-row" key={`extra-${index}`}>
                    <label className="quotes-field">
                      Tipo
                      <input
                        type="text"
                        value={item.type}
                        onChange={handleExtraCostChange(
                          setDraftFormData,
                          index,
                          "type",
                        )}
                      />
                    </label>
                    <label className="quotes-field">
                      Costo
                      <input
                        type="number"
                        value={item.cost}
                        onChange={handleExtraCostChange(
                          setDraftFormData,
                          index,
                          "cost",
                        )}
                      />
                    </label>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleRemoveExtraCost(setDraftFormData, index)}
                    >
                      Quitar
                    </Button>
                  </div>
                ))}
                {!draftFormData.version.extraCosts.length && (
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
              <Button
                variant="secondary"
                size="sm"
                onClick={handleAddSupply(setDraftFormData)}
              >
                Agregar
              </Button>
            </div>
            <div className="quotes-items">
              {draftFormData.supplies.map((item, index) => (
                <div className="quotes-item-row" key={`supply-${index}`}>
                  <label className="quotes-field">
                    Insumo
                    <select
                      value={item.suppliesId}
                      onChange={handleSupplyChange(
                        setDraftFormData,
                        index,
                        "suppliesId",
                      )}
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
                      onChange={handleSupplyChange(
                        setDraftFormData,
                        index,
                        "usageQuantity",
                      )}
                    />
                  </label>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleRemoveSupply(setDraftFormData, index)}
                  >
                    Quitar
                  </Button>
                </div>
              ))}
              {!draftFormData.supplies.length && (
                <p className="quotes-empty">Sin insumos agregados.</p>
              )}
            </div>
          </div>

          <div className="quotes-section">
            <div className="quotes-section-header">
              <h3 className="quotes-section-title">Activos</h3>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleAddAsset(setDraftFormData)}
              >
                Agregar
              </Button>
            </div>
            <div className="quotes-items">
              {draftFormData.assets.map((item, index) => (
                <div className="quotes-item-row" key={`asset-${index}`}>
                  <label className="quotes-field">
                    Activo
                    <select
                      value={item.assetsId}
                      onChange={handleAssetChange(
                        setDraftFormData,
                        index,
                        "assetsId",
                      )}
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
                      onChange={handleAssetChange(
                        setDraftFormData,
                        index,
                        "usageQuantity",
                      )}
                    />
                  </label>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleRemoveAsset(setDraftFormData, index)}
                  >
                    Quitar
                  </Button>
                </div>
              ))}
              {!draftFormData.assets.length && (
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
                  setDraftImageFiles(
                    event.target.files ? Array.from(event.target.files) : [],
                  )
                }
              />
            </label>
            {!!draftFormData.images.length && (
              <div className="quotes-tags">
                {draftFormData.images.map((image) => (
                  <span className="quotes-tag" key={image}>
                    {image}
                    <button
                      type="button"
                      onClick={handleRemoveImage(setDraftFormData, image)}
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
            )}
            {!!draftImagePreviews.length && (
              <div className="quotes-image-grid">
                {draftImagePreviews.map((preview) => (
                  <img
                    key={preview.url}
                    src={preview.url}
                    alt={preview.file.name}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {draftPayloadError && (
          <p className="quotes-error">{draftPayloadError}</p>
        )}
        {draftActionMessage && (
          <p className="quotes-helper">{draftActionMessage}</p>
        )}
      </section>
    );
  };

  return (
    <section className="quotes-page">
      <header className="quotes-header">
        <div>
          <p className="quotes-kicker">Cotizaciones</p>
          <h1 className="quotes-title">
            {activeTab === "listado"
              ? "Listado y filtros"
              : activeTab === "contexto"
                ? "Contexto y desglose"
                : "Crear y editar"}
          </h1>
          <p className="quotes-subtitle">
            Consulta, crea y actualiza cotizaciones desde la UI.
          </p>
        </div>
        <div className="quotes-toolbar">
          {activeTab === "listado" ? (
            <>
              <Button variant="secondary" onClick={() => loadQuotations()}>
                Recargar lista
              </Button>
              <Button variant="primary" onClick={handleOpenNew}>
                Crear cotizacion
              </Button>
            </>
          ) : activeTab === "contexto" ? (
            <>
              <Button variant="secondary" onClick={() => setActiveTab("crear")}>
                Ir a crear
              </Button>
              <Button variant="primary" onClick={() => handleLoadContext("")}>
                Contexto nuevo
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                onClick={() => setActiveTab("listado")}
              >
                Ir al listado
              </Button>
              <Button variant="primary" onClick={() => handleLoadContext("")}>
                Contexto nuevo
              </Button>
              <Button
                variant="secondary"
                onClick={handleUpdate}
                disabled={actionLoading || !updateId}
              >
                {actionLoading ? "Enviando..." : "Actualizar cotización"}
              </Button>
            </>
          )}
        </div>
      </header>

      <nav className="config-tabs">
        <button
          type="button"
          className={`config-tab ${activeTab === "crear" ? "active" : ""}`}
          onClick={() => setActiveTab("crear")}
        >
          Crear cotizacion
        </button>
        <button
          type="button"
          className={`config-tab ${activeTab === "listado" ? "active" : ""}`}
          onClick={() => setActiveTab("listado")}
        >
          Filtros y tabla
        </button>
        <button
          type="button"
          className={`config-tab ${activeTab === "contexto" ? "active" : ""}`}
          onClick={() => setActiveTab("contexto")}
        >
          Contexto y desglose
        </button>
      </nav>

      {activeTab === "listado" && (
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
                  onChange={handleFilterChange("year")}
                />
              </label>
              <label className="quotes-field">
                Mes
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={filters.month}
                  onChange={handleFilterChange("month")}
                />
              </label>
              <label className="quotes-field">
                Tipo producto
                <input
                  type="number"
                  value={filters.productType}
                  onChange={handleFilterChange("productType")}
                />
              </label>
              <label className="quotes-field">
                Estado
                <input
                  type="number"
                  value={filters.status}
                  onChange={handleFilterChange("status")}
                />
              </label>
              <label className="quotes-field">
                Busqueda
                <input
                  type="text"
                  value={filters.search}
                  onChange={handleFilterChange("search")}
                />
              </label>
              <div className="quotes-actions">
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? "Cargando..." : "Buscar"}
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
              <h2 className="quotes-panel-title">Tabla de cotizaciones</h2>
              <span className="quotes-panel-meta">
                {quotations.length} resultados
              </span>
            </div>
            <div className="quotes-table-container">
              <table className="quotes-table">
                <thead>
                  <tr>
                    <th>Imagen</th>
                    <th>ID</th>
                    <th>Titulo</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                    <th>Tipo</th>
                    <th>Editado por</th>
                    <th>Accion</th>
                  </tr>
                </thead>
                <tbody>
                  {quotations.map((item) => (
                    <tr key={item.quotationId}>
                      <td>
                        {item.images?.[0] ? (
                          <img
                            className="quotes-table-image"
                            src={item.images[0]}
                            alt={item.title}
                          />
                        ) : (
                          <span className="quotes-meta">Sin imagen</span>
                        )}
                      </td>
                      <td>{item.quotationId}</td>
                      <td>{item.title}</td>
                      <td>{formatDate(item.date)}</td>
                      <td>{item.status}</td>
                      <td>{item.productType}</td>
                      <td>{currentSessionUser}</td>
                      <td>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenEdit(item.quotationId)}
                        >
                          Editar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!quotations.length && !loading && (
              <p className="quotes-empty">Sin cotizaciones para mostrar.</p>
            )}
          </section>
        </>
      )}

      {activeTab === "contexto" && (
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
                  {contextLoading ? "Cargando..." : "Cargar"}
                </Button>
              </div>
            </div>
            {contextError && <p className="quotes-error">{contextError}</p>}
            <div className="quotes-summary">
              <div>
                <p className="quotes-meta">Catalogos</p>
                <p className="quotes-summary-value">
                  {suppliesCatalog.length} insumos • {assetsCatalog.length}{" "}
                  assets
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
              <h2 className="quotes-panel-title">Desglose de costos</h2>
              <span className="quotes-panel-meta">Respuesta del servidor</span>
            </div>
            {costBreakdown ? (
              <>
                <div className="quotes-summary">
                  <div>
                    <p className="quotes-meta">Materiales</p>
                    <p className="quotes-summary-value">
                      {costBreakdown.materialsCost ?? 0}
                    </p>
                  </div>
                  <div>
                    <p className="quotes-meta">Activos</p>
                    <p className="quotes-summary-value">
                      {costBreakdown.assetsCost ?? 0}
                    </p>
                  </div>
                  <div>
                    <p className="quotes-meta">Mano de obra</p>
                    <p className="quotes-summary-value">
                      {costBreakdown.laborCost ?? 0}
                    </p>
                  </div>
                  <div>
                    <p className="quotes-meta">Extras</p>
                    <p className="quotes-summary-value">
                      {costBreakdown.extraCosts ?? 0}
                    </p>
                  </div>
                  <div>
                    <p className="quotes-meta">Base</p>
                    <p className="quotes-summary-value">
                      {costBreakdown.baseCost ?? 0}
                    </p>
                  </div>
                  <div>
                    <p className="quotes-meta">Margen</p>
                    <p className="quotes-summary-value">
                      {costBreakdown.profitMargin ?? 0}%
                    </p>
                  </div>
                  <div>
                    <p className="quotes-meta">Ganancia</p>
                    <p className="quotes-summary-value">
                      {costBreakdown.profit ?? 0}
                    </p>
                  </div>
                  <div>
                    <p className="quotes-meta">Subtotal</p>
                    <p className="quotes-summary-value">
                      {costBreakdown.subTotal ?? 0}
                    </p>
                  </div>
                  <div>
                    <p className="quotes-meta">Descuento</p>
                    <p className="quotes-summary-value">
                      {costBreakdown.discount ?? 0}
                    </p>
                  </div>
                  <div>
                    <p className="quotes-meta">Impuesto</p>
                    <p className="quotes-summary-value">
                      {costBreakdown.productTax ?? 0}
                    </p>
                  </div>
                  <div>
                    <p className="quotes-meta">Total</p>
                    <p className="quotes-summary-value">
                      {costBreakdown.totalCost ?? 0}
                    </p>
                  </div>
                </div>
                <div className="quotes-items">
                  {Array.isArray(costBreakdown.supplies) &&
                    costBreakdown.supplies.map((item, index) => (
                      <div className="quotes-item-row" key={`cost-${index}`}>
                        <div>
                          <p className="quotes-meta">Insumo</p>
                          <p className="quotes-summary-value">{item.name}</p>
                        </div>
                        <div>
                          <p className="quotes-meta">Cantidad</p>
                          <p className="quotes-summary-value">
                            {item.usageQuantity ?? 0}
                          </p>
                        </div>
                        <div>
                          <p className="quotes-meta">Costo</p>
                          <p className="quotes-summary-value">
                            {item.cost ?? 0}
                          </p>
                        </div>
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
      )}

      {activeTab === "crear" && renderQuotationPanel()}

      {isEditModalOpen && (
        <div className="quotes-modal-backdrop">
          <div
            className="quotes-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Editar cotizacion"
            onClick={(event) => event.stopPropagation()}
          >
            {renderQuotationPanel({ isModal: true })}
          </div>
        </div>
      )}
    </section>
  );
}

export default Cotizaciones;
