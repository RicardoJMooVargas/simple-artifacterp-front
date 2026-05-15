import { ApiService } from "../ApiService";

export const InventoryCatalogsService = {
  listAssets() {
    return ApiService.request("inventoryCatalogsAssetsList");
  },
  getAssetById(id) {
    return ApiService.request("inventoryCatalogsAssetsGetById", {
      pathParams: { id },
    });
  },
  createAsset(payload) {
    const formData = new FormData();

    Object.entries(payload || {}).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        return;
      }

      if (value instanceof File) {
        formData.append(key, value);
        return;
      }

      formData.append(key, String(value));
    });

    return ApiService.request("inventoryCatalogsAssetsCreate", {
      body: formData,
    });
  },
  updateAsset(id, payload) {
    return ApiService.request("inventoryCatalogsAssetsUpdate", {
      pathParams: { id },
      body: payload,
    });
  },
  deleteAsset(id, forceDelete = false) {
    return ApiService.request("inventoryCatalogsAssetsDelete", {
      pathParams: { id },
      body: { forceDelete },
    });
  },
  uploadSupplyImage(id, file) {
    const formData = new FormData();
    formData.append("file", file);

    return ApiService.request("inventoryCatalogsSuppliesUploadImage", {
      pathParams: { id },
      body: formData,
    });
  },
  listSupplies() {
    return ApiService.request("inventoryCatalogsSuppliesList");
  },
  getSupplyById(id) {
    return ApiService.request("inventoryCatalogsSuppliesGetById", {
      pathParams: { id },
    });
  },
  createSupply(payload) {
    const formData = new FormData();

    Object.entries(payload || {}).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        return;
      }

      if (value instanceof File) {
        formData.append(key, value);
        return;
      }

      formData.append(key, String(value));
    });

    return ApiService.request("inventoryCatalogsSuppliesCreate", {
      body: formData,
    });
  },
  updateSupply(id, payload) {
    return ApiService.request("inventoryCatalogsSuppliesUpdate", {
      pathParams: { id },
      body: payload,
    });
  },
  deleteSupply(id, forceDelete = false) {
    return ApiService.request("inventoryCatalogsSuppliesDelete", {
      pathParams: { id },
      body: { forceDelete },
    });
  },
  listUnitsMeasurement() {
    return ApiService.request("inventoryCatalogsUnitsMeasurementList");
  },
  getUnitMeasurementById(id) {
    return ApiService.request("inventoryCatalogsUnitsMeasurementGetById", {
      pathParams: { id },
    });
  },
  createUnitMeasurement(payload) {
    return ApiService.request("inventoryCatalogsUnitsMeasurementCreate", {
      body: payload,
    });
  },
  updateUnitMeasurement(id, payload) {
    return ApiService.request("inventoryCatalogsUnitsMeasurementUpdate", {
      pathParams: { id },
      body: payload,
    });
  },
  deleteUnitMeasurement(id, forceDelete = false) {
    return ApiService.request("inventoryCatalogsUnitsMeasurementDelete", {
      pathParams: { id },
      body: { forceDelete },
    });
  },
};
