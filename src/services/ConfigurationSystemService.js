import { ApiService } from './ApiService'

const appendFormData = (formData, payload) => {
  Object.entries(payload || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return
    }

    if (value instanceof File) {
      formData.append(key, value)
      return
    }

    formData.append(key, String(value))
  })
}

export const ConfigurationSystemService = {
  checkConfiguration() {
    return ApiService.request('configurationSystemCheck')
  },
  getConfiguration() {
    return ApiService.request('configurationSystemGet')
  },
  updateConfiguration(id, payload) {
    const formData = new FormData()
    appendFormData(formData, payload)

    return ApiService.request('configurationSystemUpdate', {
      pathParams: { id },
      body: formData,
    })
  },
  uploadFile(file) {
    const formData = new FormData()
    formData.append('file', file)

    return ApiService.request('configurationSystemFilesUpload', {
      body: formData,
    })
  },
  listFiles() {
    return ApiService.request('configurationSystemFilesList')
  },
}
