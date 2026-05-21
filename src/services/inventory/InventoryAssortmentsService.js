import { ApiService } from '../ApiService'

export const InventoryAssortmentsService = {
  listAssortments(query) {
    return ApiService.request('inventoryAssortmentsList', { query })
  },
  createAssortment(payload) {
    return ApiService.request('inventoryAssortmentsCreate', { body: payload })
  },
  finalizeAssortment(id, payload) {
    return ApiService.request('inventoryAssortmentsFinalize', {
      pathParams: { id },
      body: payload,
    })
  },
  createDirectInventory(payload) {
    return ApiService.request('inventoryAssortmentsDirectInventory', {
      body: payload,
    })
  },
  listInventorySupplies() {
    return ApiService.request('inventoryAssortmentsInventorySupplies')
  },
}
