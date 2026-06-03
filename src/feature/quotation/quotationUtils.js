export const emptyQuotationPayload = {
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

export const getSessionUserName = (session) =>
  session?.user?.name ||
  session?.user?.userName ||
  session?.userName ||
  "Invitado";

export const formatDate = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("es-MX");
};

export const toDateInputValue = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
};

export const toNumber = (value) =>
  value === "" || value === null || value === undefined ? 0 : Number(value);

export const createInitialDraft = (userName) => ({
  ...emptyQuotationPayload,
  date: toDateInputValue(new Date().toISOString()),
  lastEditedByName: userName,
  version: {
    ...emptyQuotationPayload.version,
    lastEditedByName: userName,
  },
});

export const quotationResponseToDraft = (response, userName, currentDraft) => {
  const quotation = response?.quotation?.quotation;
  const version = response?.quotation?.version;

  if (!quotation) {
    const draft = currentDraft ?? createInitialDraft(userName);

    return {
      ...draft,
      date: draft.date || toDateInputValue(new Date().toISOString()),
      lastEditedByName: userName,
      version: {
        ...draft.version,
        lastEditedByName: userName,
      },
    };
  }

  return {
    title: quotation.title ?? "",
    date: toDateInputValue(quotation.date),
    clientId: quotation.clientId ?? 0,
    description: quotation.description ?? "",
    status: quotation.status ?? 0,
    productType: quotation.productType ?? 0,
    images: Array.isArray(quotation.images) ? quotation.images : [],
    lastEditedByName: quotation.lastEditedByName ?? userName,
    version: {
      subDescription: version?.subDescription ?? "",
      versionNumber: version?.versionNumber ?? 1,
      profitMargin: version?.profitMargin ?? 0,
      extraCosts: Array.isArray(version?.extraCosts) ? version.extraCosts : [],
      productTax: version?.productTax ?? 0,
      laborCost: version?.laborCost ?? 0,
      discount: version?.discount ?? 0,
      lastEditedByName: version?.lastEditedByName ?? userName,
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
  };
};

const mapOptionList = (items) =>
  Array.isArray(items)
    ? items.map((item, index) => ({
        value: item?.value ?? item?.id ?? item?.key ?? index,
        name:
          item?.name ??
          item?.label ??
          item?.description ??
          String(item?.value ?? item?.id ?? item?.key ?? index),
      }))
    : [];

export const getQuotationContextCatalogs = (contextData) => {
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

  return {
    productTypes: mapOptionList(productTypesRaw),
    quoteStatuses: mapOptionList(quoteStatusesRaw),
    suppliesCatalog: contextData?.suppliesCatalog ?? [],
    assetsCatalog: contextData?.assetsCatalog ?? [],
    costBreakdown: contextData?.quotation?.costBreakdown,
  };
};

export const buildQuotationPayload = (draft, userName) => ({
  title: draft.title,
  date: draft.date ? new Date(draft.date).toISOString() : new Date().toISOString(),
  clientId: toNumber(draft.clientId),
  description: draft.description,
  status: toNumber(draft.status),
  productType: toNumber(draft.productType),
  images: Array.isArray(draft.images) ? draft.images : [],
  lastEditedByName: userName,
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
    lastEditedByName: userName,
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
});
