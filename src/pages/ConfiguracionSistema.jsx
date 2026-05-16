import { useEffect, useMemo, useState } from 'react'
import { Image, RefreshCcw, Settings2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import { ConfigurationSystemService } from '../services/ConfigurationSystemService'

const emptyForm = {
  commercialName: '',
  logo: '',
  background: '',
  costOfElectricity: '',
}

const toNumber = (value) => (value === '' || value === null ? 0 : Number(value))

function ConfiguracionSistema() {
  const [config, setConfig] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState('')
  const [backgroundFile, setBackgroundFile] = useState(null)
  const [backgroundPreview, setBackgroundPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const headerMeta = useMemo(() => {
    if (!config?.updatedAt) {
      return 'Sin cambios recientes'
    }

    const formatted = new Date(config.updatedAt).toLocaleString()
    return `Actualizado: ${formatted}`
  }, [config?.updatedAt])

  useEffect(() => {
    void loadConfiguration()
  }, [])

  useEffect(() => {
    if (!backgroundFile) {
      setBackgroundPreview('')
      return undefined
    }

    const objectUrl = URL.createObjectURL(backgroundFile)
    setBackgroundPreview(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [backgroundFile])

  useEffect(() => {
    if (!logoFile) {
      setLogoPreview('')
      return undefined
    }

    const objectUrl = URL.createObjectURL(logoFile)
    setLogoPreview(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [logoFile])

  const loadConfiguration = async () => {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const data = await ConfigurationSystemService.getConfiguration()
      setConfig(data)
      setForm({
        commercialName: data?.commercialName ?? '',
        logo: data?.logo ?? '',
        background: data?.background ?? '',
        costOfElectricity:
          data?.costOfElectricity === null || data?.costOfElectricity === undefined
            ? ''
            : String(data.costOfElectricity),
      })
    } catch (err) {
      setError(err?.message ?? 'Error al cargar configuracion')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] ?? null
    setBackgroundFile(file)
  }

  const handleLogoFileChange = (event) => {
    const file = event.target.files?.[0] ?? null
    setLogoFile(file)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!config?.id) {
      setError('No hay configuracion disponible para actualizar')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const payload = {
        commercialName: form.commercialName,
        logo: form.logo,
        background: form.background,
        costOfElectricity: toNumber(form.costOfElectricity),
        logoFile,
        backgroundFile,
      }

      const updated = await ConfigurationSystemService.updateConfiguration(
        config.id,
        payload
      )
      setConfig(updated)
      setSuccess('Configuracion actualizada')
      setLogoFile(null)
      setBackgroundFile(null)
      if (updated) {
        setForm({
          commercialName: updated.commercialName ?? '',
          logo: updated.logo ?? '',
          background: updated.background ?? '',
          costOfElectricity:
            updated.costOfElectricity === null ||
            updated.costOfElectricity === undefined
              ? ''
              : String(updated.costOfElectricity),
        })
      }
    } catch (err) {
      setError(err?.message ?? 'Error al guardar configuracion')
    } finally {
      setSaving(false)
    }
  }

  const previewImage = backgroundPreview || config?.background || ''
  const previewLogo = logoPreview || config?.logo || ''
  const costDisplay =
    form.costOfElectricity !== ''
      ? form.costOfElectricity
      : config?.costOfElectricity ?? '0'

  return (
    <section className="config-page">
      <header className="config-header">
        <div>
          <p className="config-kicker">Administracion</p>
          <h2 className="config-title">Configuracion del sistema</h2>
          <p className="config-subtitle">{headerMeta}</p>
        </div>
        <div className="config-actions">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={loadConfiguration}
            disabled={loading}
          >
            <RefreshCcw size={16} />
            {loading ? 'Actualizando...' : 'Actualizar datos'}
          </Button>
        </div>
      </header>

      <div className="config-grid">
        <div className="config-panel">
          <form className="crud-form" onSubmit={handleSubmit}>
            <div className="crud-grid-fields">
              <label className="crud-field">
                Nombre comercial
                <input
                  type="text"
                  value={form.commercialName}
                  onChange={handleChange('commercialName')}
                  placeholder="Simple Artifact ERP"
                />
              </label>
              <label className="crud-field">
                Logo (URL)
                <input
                  type="text"
                  value={form.logo}
                  onChange={handleChange('logo')}
                  placeholder="https://.../logo.png"
                />
              </label>
              <label className="crud-field">
                Fondo (URL)
                <input
                  type="text"
                  value={form.background}
                  onChange={handleChange('background')}
                  placeholder="https://.../background.png"
                />
              </label>
              <label className="crud-field">
                Costo de electricidad
                <div className="field-with-suffix">
                  <input
                    type="number"
                    value={form.costOfElectricity}
                    onChange={handleChange('costOfElectricity')}
                    placeholder="0"
                    step="0.01"
                    min="0"
                  />
                  <span className="field-suffix">kWh</span>
                </div>
              </label>
            </div>

            <label className="crud-field">
              Logo del sistema
              <input type="file" accept="image/*" onChange={handleLogoFileChange} />
            </label>

            <label className="crud-field">
              Imagen de fondo
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </label>

            <div className="crud-form-actions">
              <Button type="submit" variant="primary" size="sm" disabled={saving}>
                <Settings2 size={16} />
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </Button>
              {error && <span className="config-error">{error}</span>}
              {success && <span className="config-success">{success}</span>}
            </div>
          </form>
        </div>

        <aside className="config-preview">
          <div className="config-preview-card">
            <div className="config-preview-header">
              <Image size={18} />
              <span>Vista previa de logo</span>
            </div>
            {previewLogo ? (
              <div className="image-preview">
                <img src={previewLogo} alt="Logo del sistema" />
              </div>
            ) : (
              <p className="image-empty">Sin logo configurado</p>
            )}
          </div>

          <div className="config-preview-card">
            <div className="config-preview-header">
              <Image size={18} />
              <span>Vista previa de fondo</span>
            </div>
            {previewImage ? (
              <div className="image-preview">
                <img src={previewImage} alt="Fondo del sistema" />
              </div>
            ) : (
              <p className="image-empty">Sin imagen configurada</p>
            )}
          </div>

          <div className="config-preview-card">
            <p className="config-meta">Nombre comercial</p>
            <p className="config-meta-value">
              {form.commercialName || config?.commercialName || 'Sin definir'}
            </p>
            <p className="config-meta">Logo</p>
            <p className="config-meta-value">
              {form.logo || config?.logo || 'Sin definir'}
            </p>
            <p className="config-meta">Costo electricidad</p>
            <p className="config-meta-value">
              {costDisplay} kWh
            </p>
          </div>
        </aside>
      </div>
    </section>
  )
}

export default ConfiguracionSistema
