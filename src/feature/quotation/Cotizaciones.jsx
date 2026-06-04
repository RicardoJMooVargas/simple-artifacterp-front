import { useEffect, useMemo, useState } from "react";
import { useSession } from "../../auth/auth";
import { QuotationsService } from "../../services/quotations/QuotationsService";
import QuotationContextView from "./components/QuotationContextView";
import QuotationEditModal from "./components/QuotationEditModal";
import QuotationFormPanel from "./components/QuotationFormPanel";
import QuotationListView from "./components/QuotationListView";
import QuotationPageHeader from "./components/QuotationPageHeader";
import { useImagePreviews } from "./hooks/useImagePreviews";
import {
  buildQuotationPayload,
  createInitialDraft,
  getQuotationContextCatalogs,
  getSessionUserName,
  quotationResponseToDraft,
} from "./quotationUtils";
import "./Cotizaciones.css";

const defaultFilters = {
  year: "",
  month: "",
  productType: "",
  status: "",
  search: "",
};

function Cotizaciones() {
  const { session } = useSession();
  const sessionUserName = getSessionUserName(session);
  const [activeTab, setActiveTab] = useState("listado");
  const [filters, setFilters] = useState(defaultFilters);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [contextId, setContextId] = useState("");
  const [contextLoading, setContextLoading] = useState(false);
  const [contextError, setContextError] = useState("");
  const [contextData, setContextData] = useState(null);

  const [formData, setFormData] = useState(() =>
    createInitialDraft(sessionUserName),
  );
  const [payloadError, setPayloadError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const imagePreviews = useImagePreviews(imageFiles);
  const [updateId, setUpdateId] = useState("");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editContextId, setEditContextId] = useState("");
  const [editContextLoading, setEditContextLoading] = useState(false);
  const [editContextError, setEditContextError] = useState("");
  const [editContextData, setEditContextData] = useState(null);
  const [editFormData, setEditFormData] = useState(() =>
    createInitialDraft(sessionUserName),
  );
  const [editPayloadError, setEditPayloadError] = useState("");
  const [editActionLoading, setEditActionLoading] = useState(false);
  const [editActionMessage, setEditActionMessage] = useState("");
  const [editImageFiles, setEditImageFiles] = useState([]);
  const editImagePreviews = useImagePreviews(editImageFiles);
  const [editUpdateId, setEditUpdateId] = useState("");

  const filtersReady = useMemo(() => {
    if (!filters.year && !filters.month) {
      return true;
    }
    return Boolean(filters.year && filters.month);
  }, [filters.month, filters.year]);

  const {
    productTypes,
    quoteStatuses,
    suppliesCatalog,
    assetsCatalog,
    costBreakdown,
  } = getQuotationContextCatalogs(contextData);
  const {
    productTypes: editProductTypes,
    quoteStatuses: editQuoteStatuses,
    suppliesCatalog: editSuppliesCatalog,
    assetsCatalog: editAssetsCatalog,
    costBreakdown: editCostBreakdown,
  } = getQuotationContextCatalogs(editContextData);
  const hasQuotationContext = Boolean(
    contextData?.quotation?.quotation || contextData?.quotation?.costBreakdown,
  );
  const hasEditQuotationContext = Boolean(
    editContextData?.quotation?.quotation ||
      editContextData?.quotation?.costBreakdown,
  );

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

  const applyQuotationToDraft = (response, setDraftFormData) => {
    setDraftFormData((current) =>
      quotationResponseToDraft(response, sessionUserName, current),
    );
  };

  const loadContext = async (useId) => {
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

  const loadEditContext = async (useId) => {
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

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadQuotations();
    }, 0);

    return () => window.clearTimeout(timer);
    // Initial list load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab === "crear" && !contextData && !contextLoading) {
      const timer = window.setTimeout(() => {
        void loadContext(contextId || "");
      }, 0);

      return () => window.clearTimeout(timer);
    }

    return undefined;
    // Context is loaded when entering this view; form edits should not retrigger it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const resetFormState = () => {
    setContextId("");
    setUpdateId("");
    setContextData(null);
    setContextError("");
    setFormData(createInitialDraft(sessionUserName));
    setPayloadError("");
    setActionMessage("");
    setImageFiles([]);
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

  const handleOpenNew = () => {
    resetFormState();
    setActiveTab("crear");
    void loadContext("");
  };

  const handleOpenEdit = (quotationId) => {
    setEditContextId(String(quotationId));
    setEditUpdateId(String(quotationId));
    setEditContextError("");
    setEditPayloadError("");
    setEditActionMessage("");
    setEditContextData(null);
    setEditImageFiles([]);
    setEditFormData(createInitialDraft(sessionUserName));
    setIsEditModalOpen(true);
    void loadEditContext(quotationId);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditPayloadError("");
    setEditActionMessage("");
    setEditContextData(null);
  };

  const getPayload = (draft, setDraftPayloadError) => {
    if (!draft.title) {
      setDraftPayloadError("El titulo es obligatorio.");
      return null;
    }

    setDraftPayloadError("");
    return buildQuotationPayload(draft, sessionUserName);
  };

  const handleCreate = async () => {
    const payload = getPayload(formData, setPayloadError);
    if (!payload) {
      return;
    }

    setActionLoading(true);
    setActionMessage("");
    try {
      const response = await QuotationsService.createQuotation(payload, imageFiles);
      setContextData(response);
      applyQuotationToDraft(response, setFormData);
      if (response?.quotation?.quotation?.quotationId) {
        setUpdateId(String(response.quotation.quotation.quotationId));
      }
      setImageFiles([]);
      setActionMessage("Cotizacion creada correctamente.");
      await loadQuotations();
    } catch (err) {
      setActionMessage(err?.message ?? "Error al crear cotizacion");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async () => {
    const payload = getPayload(editFormData, setEditPayloadError);
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

  return (
    <section className="quotes-page">
      <QuotationPageHeader
        activeTab={activeTab}
        onGoList={() => setActiveTab("listado")}
        onLoadNewContext={() => loadContext("")}
        onOpenNew={handleOpenNew}
        onReload={() => loadQuotations()}
      />

      {activeTab === "listado" && (
        <QuotationListView
          currentUser={sessionUserName || "-"}
          error={error}
          filters={filters}
          filtersReady={filtersReady}
          loading={loading}
          quotations={quotations}
          onFilterChange={handleFilterChange}
          onOpenEdit={handleOpenEdit}
          onSearch={handleSearch}
        />
      )}

      {activeTab === "crear" && (
        <>
          <QuotationFormPanel
            actionLoading={actionLoading}
            actionMessage={actionMessage}
            assetsCatalog={assetsCatalog}
            contextError={contextError}
            contextLoading={contextLoading}
            draft={formData}
            imagePreviews={imagePreviews}
            payloadError={payloadError}
            productTypes={productTypes}
            quoteStatuses={quoteStatuses}
            suppliesCatalog={suppliesCatalog}
            updateId={updateId}
            onAction={handleCreate}
            onChange={setFormData}
            onFileChange={setImageFiles}
          />
          {hasQuotationContext && (
            <QuotationContextView
              showControls={false}
              assetsCatalog={assetsCatalog}
              contextData={contextData}
              contextError={contextError}
              contextId={contextId}
              contextLoading={contextLoading}
              costBreakdown={costBreakdown}
              productTypes={productTypes}
              quoteStatuses={quoteStatuses}
              suppliesCatalog={suppliesCatalog}
            />
          )}
        </>
      )}

      {isEditModalOpen && (
        <QuotationEditModal
          actionLoading={editActionLoading}
          actionMessage={editActionMessage}
          assetsCatalog={editAssetsCatalog}
          contextError={editContextError}
          contextLoading={editContextLoading}
          draft={editFormData}
          imagePreviews={editImagePreviews}
          payloadError={editPayloadError}
          productTypes={editProductTypes}
          quoteStatuses={editQuoteStatuses}
          suppliesCatalog={editSuppliesCatalog}
          updateId={editUpdateId}
          onAction={handleUpdate}
          onChange={setEditFormData}
          onClose={handleCloseEditModal}
          onFileChange={setEditImageFiles}
          contextViewProps={
            hasEditQuotationContext
              ? {
                  assetsCatalog: editAssetsCatalog,
                  contextData: editContextData,
                  contextError: editContextError,
                  contextId: editContextId,
                  contextLoading: editContextLoading,
                  costBreakdown: editCostBreakdown,
                  productTypes: editProductTypes,
                  quoteStatuses: editQuoteStatuses,
                  suppliesCatalog: editSuppliesCatalog,
                }
              : null
          }
        />
      )}
    </section>
  );
}

export default Cotizaciones;
