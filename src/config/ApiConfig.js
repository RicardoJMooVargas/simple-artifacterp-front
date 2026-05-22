import { EmptyRequest } from "../models/requests/EmptyRequest";
import { LoginRequest } from "../models/requests/LoginRequest";
import { RegisterUserRequest } from "../models/requests/RegisterUserRequest";
import { AssetUpsertRequest } from "../models/requests/inventory/AssetUpsertRequest";
import { ForceDeleteRequest } from "../models/requests/inventory/ForceDeleteRequest";
import { SupplyUpsertRequest } from "../models/requests/inventory/SupplyUpsertRequest";
import { UnitMeasurementUpsertRequest } from "../models/requests/inventory/UnitMeasurementUpsertRequest";
import { UploadImageRequest } from "../models/requests/inventory/UploadImageRequest";
import { QuotationUpsertRequest } from "../models/requests/quotations/QuotationUpsertRequest";
import { LoginResponse } from "../models/responses/LoginResponse";
import { RegisterUserResponse } from "../models/responses/RegisterUserResponse";
import { UserResponse } from "../models/responses/UserResponse";
import { AssetResponse } from "../models/responses/inventory/AssetResponse";
import { SupplyResponse } from "../models/responses/inventory/SupplyResponse";
import { UnitMeasurementResponse } from "../models/responses/inventory/UnitMeasurementResponse";
import { ConfigurationSystemResponse } from "../models/responses/ConfigurationSystemResponse";
import { QuotationContextResponse } from "../models/responses/quotations/QuotationContextResponse";
import { QuotationListItemResponse } from "../models/responses/quotations/QuotationListItemResponse";

const host = import.meta.env.VITE_API_HOST || "";

export const ApiConfig = {
  host,
  endpoints: {
    systemManagerLogin: {
      method: "POST",
      path: "/api/SystemManager/login",
      requestModel: LoginRequest,
      responseModel: LoginResponse,
    },
    systemManagerRegister: {
      method: "POST",
      path: "/api/SystemManager/register",
      requestModel: RegisterUserRequest,
      responseModel: RegisterUserResponse,
    },
    systemManagerUsers: {
      method: "GET",
      path: "/api/SystemManager/users",
      requestModel: EmptyRequest,
      responseModel: UserResponse,
    },
    inventoryCatalogsAssetsList: {
      method: "GET",
      path: "/api/inventory/catalogs/assets",
      requestModel: EmptyRequest,
      responseModel: AssetResponse,
    },
    inventoryCatalogsAssetsGetById: {
      method: "GET",
      path: "/api/inventory/catalogs/assets/:id",
      requestModel: EmptyRequest,
      responseModel: AssetResponse,
    },
    inventoryCatalogsAssetsCreate: {
      method: "POST",
      path: "/api/inventory/catalogs/assets",
      requestModel: AssetUpsertRequest,
      responseModel: AssetResponse,
    },
    inventoryCatalogsAssetsUpdate: {
      method: "PUT",
      path: "/api/inventory/catalogs/assets/:id",
      requestModel: AssetUpsertRequest,
      responseModel: AssetResponse,
    },
    inventoryCatalogsAssetsDelete: {
      method: "DELETE",
      path: "/api/inventory/catalogs/assets/:id",
      requestModel: ForceDeleteRequest,
      responseModel: null,
    },
    inventoryCatalogsSuppliesUploadImage: {
      method: "POST",
      path: "/api/inventory/catalogs/supplies/:id/image",
      requestModel: UploadImageRequest,
      responseModel: SupplyResponse,
    },
    inventoryCatalogsSuppliesList: {
      method: "GET",
      path: "/api/inventory/catalogs/supplies",
      requestModel: EmptyRequest,
      responseModel: SupplyResponse,
    },
    inventoryCatalogsSuppliesGetById: {
      method: "GET",
      path: "/api/inventory/catalogs/supplies/:id",
      requestModel: EmptyRequest,
      responseModel: SupplyResponse,
    },
    inventoryCatalogsSuppliesCreate: {
      method: "POST",
      path: "/api/inventory/catalogs/supplies",
      requestModel: SupplyUpsertRequest,
      responseModel: SupplyResponse,
    },
    inventoryCatalogsSuppliesUpdate: {
      method: "PUT",
      path: "/api/inventory/catalogs/supplies/:id",
      requestModel: SupplyUpsertRequest,
      responseModel: SupplyResponse,
    },
    inventoryCatalogsSuppliesDelete: {
      method: "DELETE",
      path: "/api/inventory/catalogs/supplies/:id",
      requestModel: ForceDeleteRequest,
      responseModel: null,
    },
    inventoryCatalogsUnitsMeasurementList: {
      method: "GET",
      path: "/api/inventory/catalogs/units-measurement",
      requestModel: EmptyRequest,
      responseModel: UnitMeasurementResponse,
    },
    inventoryCatalogsUnitsMeasurementGetById: {
      method: "GET",
      path: "/api/inventory/catalogs/units-measurement/:id",
      requestModel: EmptyRequest,
      responseModel: UnitMeasurementResponse,
    },
    inventoryCatalogsUnitsMeasurementCreate: {
      method: "POST",
      path: "/api/inventory/catalogs/units-measurement",
      requestModel: UnitMeasurementUpsertRequest,
      responseModel: UnitMeasurementResponse,
    },
    inventoryCatalogsUnitsMeasurementUpdate: {
      method: "PUT",
      path: "/api/inventory/catalogs/units-measurement/:id",
      requestModel: UnitMeasurementUpsertRequest,
      responseModel: UnitMeasurementResponse,
    },
    inventoryCatalogsUnitsMeasurementDelete: {
      method: "DELETE",
      path: "/api/inventory/catalogs/units-measurement/:id",
      requestModel: ForceDeleteRequest,
      responseModel: null,
    },
    configurationSystemCheck: {
      method: "POST",
      path: "/api/ConfigurationSystem/check",
      requestModel: EmptyRequest,
      responseModel: ConfigurationSystemResponse,
    },
    configurationSystemGet: {
      method: "GET",
      path: "/api/ConfigurationSystem",
      requestModel: EmptyRequest,
      responseModel: ConfigurationSystemResponse,
    },
    configurationSystemUpdate: {
      method: "PUT",
      path: "/api/ConfigurationSystem/:id",
      requestModel: EmptyRequest,
      responseModel: ConfigurationSystemResponse,
    },
    configurationSystemFilesUpload: {
      method: "POST",
      path: "/api/ConfigurationSystem/files",
      requestModel: EmptyRequest,
      responseModel: EmptyRequest,
    },
    configurationSystemFilesList: {
      method: "GET",
      path: "/api/ConfigurationSystem/files",
      requestModel: EmptyRequest,
      responseModel: EmptyRequest,
    },
    // Quotations endpoints
    quotationsList: {
      method: "GET",
      path: "/api/quotations/GetQuotations",
      requestModel: EmptyRequest,
      responseModel: QuotationListItemResponse,
    },
    quotationsContext: {
      method: "GET",
      path: "/api/quotations/GetQuotationContext",
      requestModel: EmptyRequest,
      responseModel: QuotationContextResponse,
    },
    quotationsCreate: {
      method: "POST",
      path: "/api/quotations/CreateQuotation",
      requestModel: QuotationUpsertRequest,
      responseModel: QuotationContextResponse,
    },
    quotationsUpdate: {
      method: "PUT",
      path: "/api/quotations/UpdateQuotation/:id",
      requestModel: QuotationUpsertRequest,
      responseModel: QuotationContextResponse,
    },
    quotationsCatalogsSupplies: {
      method: "GET",
      path: "/api/quotations/catalogs/supplies",
      requestModel: EmptyRequest,
      responseModel: SupplyResponse,
    },
    quotationsCatalogsAssets: {
      method: "GET",
      path: "/api/quotations/catalogs/assets",
      requestModel: EmptyRequest,
      responseModel: AssetResponse,
    },
    // Inventory Assortments endpoints
    inventoryAssortmentsList: {
      method: "GET",
      path: "/api/inventory/assortments",
      requestModel: EmptyRequest,
      responseModel: EmptyRequest,
    },
    inventoryAssortmentsCreate: {
      method: "POST",
      path: "/api/inventory/assortments",
      requestModel: EmptyRequest,
      responseModel: EmptyRequest,
    },
    inventoryAssortmentsFinalize: {
      method: "PUT",
      path: "/api/inventory/assortments/:id/finalize",
      requestModel: EmptyRequest,
      responseModel: EmptyRequest,
    },
    inventoryAssortmentsDirectInventory: {
      method: "POST",
      path: "/api/inventory/assortments/direct-inventory",
      requestModel: EmptyRequest,
      responseModel: EmptyRequest,
    },
    inventoryAssortmentsInventorySupplies: {
      method: "GET",
      path: "/api/inventory/assortments/inventory-supplies",
      requestModel: EmptyRequest,
      responseModel: EmptyRequest,
    },
  },
};
