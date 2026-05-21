import { ApiService } from "../ApiService";

const appendImageFiles = (formData, imageFiles) => {
  if (!imageFiles) {
    return;
  }

  if (Array.isArray(imageFiles)) {
    imageFiles.forEach((file) => {
      if (file) {
        formData.append("imageFiles", file);
      }
    });
    return;
  }

  const fileList = Array.from(imageFiles);
  fileList.forEach((file) => {
    if (file) {
      formData.append("imageFiles", file);
    }
  });
};

const normalizePayloadJson = (payloadJson) => {
  if (typeof payloadJson === "string") {
    return payloadJson;
  }

  return JSON.stringify(payloadJson ?? {});
};

export const QuotationsService = {
  listQuotations(filters) {
    return ApiService.request("quotationsList", {
      query: filters,
    });
  },
  getContext(quotationId) {
    return ApiService.request("quotationsContext", {
      query: quotationId ? { quotationId } : undefined,
    });
  },
  createQuotation(payloadJson, imageFiles) {
    const formData = new FormData();
    formData.append("payloadJson", normalizePayloadJson(payloadJson));
    appendImageFiles(formData, imageFiles);

    return ApiService.request("quotationsCreate", {
      body: formData,
    });
  },
  updateQuotation(id, payloadJson, imageFiles) {
    const formData = new FormData();
    formData.append("payloadJson", normalizePayloadJson(payloadJson));
    appendImageFiles(formData, imageFiles);

    return ApiService.request("quotationsUpdate", {
      pathParams: { id },
      body: formData,
    });
  },
  searchSuppliesCatalog(name) {
    return ApiService.request("quotationsCatalogsSupplies", {
      query: name ? { name } : undefined,
    });
  },
  searchAssetsCatalog(name) {
    return ApiService.request("quotationsCatalogsAssets", {
      query: name ? { name } : undefined,
    });
  },
};
