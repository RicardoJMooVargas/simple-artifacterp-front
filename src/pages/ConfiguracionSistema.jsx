import { useEffect, useMemo, useState } from "react";
import {
  Image,
  Pencil,
  RefreshCcw,
  Settings2,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { ConfigurationSystemService } from "../services/ConfigurationSystemService";
import { AuthService } from "../services/AuthService";

const emptyForm = {
  commercialName: "",
  logo: "",
  background: "",
  costOfElectricity: "",
};

const emptyUserForm = {
  userName: "",
  email: "",
  password: "",
  displayName: "",
  userType: 1,
  role: 1,
};

const toNumber = (value) =>
  value === "" || value === null ? 0 : Number(value);

function ConfiguracionSistema() {
  const [activeTab, setActiveTab] = useState("sistema");
  const [config, setConfig] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [backgroundFile, setBackgroundFile] = useState(null);
  const [backgroundPreview, setBackgroundPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const headerMeta = useMemo(() => {
    if (!config?.updatedAt) {
      return "Sin cambios recientes";
    }

    const formatted = new Date(config.updatedAt).toLocaleString();
    return `Actualizado: ${formatted}`;
  }, [config?.updatedAt]);

  useEffect(() => {
    void loadConfiguration();
  }, []);

  useEffect(() => {
    if (activeTab === "usuarios") {
      void loadUsers();
    }
  }, [activeTab]);

  useEffect(() => {
    if (!backgroundFile) {
      setBackgroundPreview("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(backgroundFile);
    setBackgroundPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [backgroundFile]);

  useEffect(() => {
    if (!logoFile) {
      setLogoPreview("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(logoFile);
    setLogoPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [logoFile]);

  const loadConfiguration = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const data = await ConfigurationSystemService.getConfiguration();
      setConfig(data);
      setForm({
        commercialName: data?.commercialName ?? "",
        logo: data?.logo ?? "",
        background: data?.background ?? "",
        costOfElectricity:
          data?.costOfElectricity === null ||
          data?.costOfElectricity === undefined
            ? ""
            : String(data.costOfElectricity),
      });
    } catch (err) {
      setError(err?.message ?? "Error al cargar configuracion");
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await AuthService.getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    setBackgroundFile(file);
  };

  const handleLogoFileChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    setLogoFile(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!config?.id) {
      setError("No hay configuracion disponible para actualizar");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        commercialName: form.commercialName,
        logo: form.logo,
        background: form.background,
        costOfElectricity: toNumber(form.costOfElectricity),
        logoFile,
        backgroundFile,
      };

      const updated = await ConfigurationSystemService.updateConfiguration(
        config.id,
        payload,
      );
      setConfig(updated);
      setSuccess("Configuracion actualizada");
      setLogoFile(null);
      setBackgroundFile(null);
      if (updated) {
        setForm({
          commercialName: updated.commercialName ?? "",
          logo: updated.logo ?? "",
          background: updated.background ?? "",
          costOfElectricity:
            updated.costOfElectricity === null ||
            updated.costOfElectricity === undefined
              ? ""
              : String(updated.costOfElectricity),
        });
      }
    } catch (err) {
      setError(err?.message ?? "Error al guardar configuracion");
    } finally {
      setSaving(false);
    }
  };

  const handleUserFormChange = (field) => (event) => {
    setUserForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleUserFormNumberChange = (field) => (event) => {
    setUserForm((prev) => ({ ...prev, [field]: Number(event.target.value) }));
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    setRegistering(true);
    setRegisterError("");
    setRegisterSuccess("");

    try {
      const result = await AuthService.register(userForm);
      if (result.success) {
        setRegisterSuccess("Usuario registrado exitosamente");
        setUserForm(emptyUserForm);
        setTimeout(() => {
          setShowRegisterModal(false);
          setRegisterSuccess("");
        }, 2000);
      } else {
        setRegisterError(result.error || "Error al registrar usuario");
      }
    } catch (err) {
      setRegisterError(err?.message ?? "Error al registrar usuario");
    } finally {
      setRegistering(false);
    }
  };

  const previewImage = backgroundPreview || config?.background || "";
  const previewLogo = logoPreview || config?.logo || "";
  const costDisplay =
    form.costOfElectricity !== ""
      ? form.costOfElectricity
      : (config?.costOfElectricity ?? "0");

  return (
    <section className="config-page">
      <header className="config-header">
        <div>
          <p className="config-kicker">Administracion</p>
          <h2 className="config-title">Configuración del sistema</h2>
          <p className="config-subtitle">{headerMeta}</p>
        </div>
        <div className="config-actions">
          {activeTab === "usuarios" && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setShowRegisterModal(true)}
            >
              <UserPlus size={16} />
              Registrar Usuarios
            </Button>
          )}
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={activeTab === "sistema" ? loadConfiguration : loadUsers}
            disabled={loading || loadingUsers}
          >
            <RefreshCcw size={16} />
            {loading || loadingUsers ? "Actualizando..." : "Actualizar datos"}
          </Button>
        </div>
      </header>

      <nav className="config-tabs">
        <button
          type="button"
          className={`config-tab ${activeTab === "sistema" ? "active" : ""}`}
          onClick={() => setActiveTab("sistema")}
        >
          <Settings2 size={16} />
          Sistema
        </button>
        <button
          type="button"
          className={`config-tab ${activeTab === "usuarios" ? "active" : ""}`}
          onClick={() => setActiveTab("usuarios")}
        >
          <UserPlus size={16} />
          Usuarios
        </button>
      </nav>

      {activeTab === "sistema" && (
        <div className="config-grid">
          <div className="config-panel">
            <form className="crud-form" onSubmit={handleSubmit}>
              <div className="crud-grid-fields">
                <label className="crud-field">
                  Nombre comercial
                  <input
                    type="text"
                    value={form.commercialName}
                    onChange={handleChange("commercialName")}
                    placeholder="Simple Artifact ERP"
                  />
                </label>
                <label className="crud-field">
                  Logo (URL)
                  <input
                    type="text"
                    value={form.logo}
                    onChange={handleChange("logo")}
                    placeholder="https://.../logo.png"
                  />
                </label>
                <label className="crud-field">
                  Fondo (URL)
                  <input
                    type="text"
                    value={form.background}
                    onChange={handleChange("background")}
                    placeholder="https://.../background.png"
                  />
                </label>
                <label className="crud-field">
                  Costo de electricidad
                  <div className="field-with-suffix">
                    <input
                      type="number"
                      value={form.costOfElectricity}
                      onChange={handleChange("costOfElectricity")}
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
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoFileChange}
                />
              </label>

              <label className="crud-field">
                Imagen de fondo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>

              <div className="crud-form-actions">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={saving}
                >
                  <Settings2 size={16} />
                  {saving ? "Guardando..." : "Guardar cambios"}
                </Button>
                {error && <span className="config-error">{error}</span>}
                {success && <span className="config-success">{success}</span>}
              </div>
            </form>
            <section className="config-preview-section">
              <div>
                <p className="config-section-kicker">Resumen</p>
                <h3 className="config-section-title">
                  Vista previa del sistema
                </h3>
              </div>

              <div className="config-preview">
                <div className="config-preview-card">
                  <p className="config-meta">Nombre comercial</p>
                  <p className="config-meta-value">
                    {form.commercialName ||
                      config?.commercialName ||
                      "Sin definir"}
                  </p>
                  <p className="config-meta">Logo</p>
                  <p className="config-meta-value">
                    {form.logo || config?.logo || "Sin definir"}
                  </p>
                  <p className="config-meta">Costo electricidad</p>
                  <p className="config-meta-value">{costDisplay} kWh</p>
                </div>

                <div className="config-preview-media">
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
                </div>
              </div>
            </section>
          </div>
        </div>
      )}

      {activeTab === "usuarios" && (
        <div className="users-section">
          {loadingUsers ? (
            <p className="users-loading">Cargando usuarios...</p>
          ) : users.length === 0 ? (
            <p className="users-empty">No hay usuarios registrados</p>
          ) : (
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Nombre de usuario</th>
                    <th>Correo electrónico</th>
                    <th>Nombre</th>
                    <th>Tipo</th>
                    <th>Rol</th>
                    <th>Fecha de registro</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.userName}</td>
                      <td>{user.email}</td>
                      <td>{user.displayName}</td>
                      <td>
                        <span className="user-badge">
                          {user.userType === 1
                            ? "Administrador"
                            : user.userType === 2
                              ? "Público"
                              : "Invitado"}
                        </span>
                      </td>
                      <td>
                        <span className="user-badge">
                          {user.role === 1
                            ? "Administrador"
                            : user.role === 2
                              ? "Público"
                              : "Invitado"}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleString()}</td>
                      <td>
                        <div className="user-actions">
                          <button
                            type="button"
                            className="user-action-btn edit"
                            onClick={() =>
                              console.log("Editar usuario:", user.id)
                            }
                            title="Editar usuario"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            className="user-action-btn delete"
                            onClick={() =>
                              console.log("Eliminar usuario:", user.id)
                            }
                            title="Eliminar usuario"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showRegisterModal && (
        <div
          className="user-register-modal"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowRegisterModal(false)}
        >
          <div
            className="user-register-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="user-register-modal-header">
              <UserPlus size={20} />
              <h3>Registrar nuevo usuario</h3>
              <button
                type="button"
                className="user-register-modal-close"
                onClick={() => setShowRegisterModal(false)}
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>
            <form
              className="user-register-form"
              onSubmit={handleRegisterSubmit}
            >
              <div className="crud-grid-fields">
                <label className="crud-field">
                  Nombre de usuario *
                  <input
                    type="text"
                    value={userForm.userName}
                    onChange={handleUserFormChange("userName")}
                    placeholder="Ricardo"
                    required
                  />
                </label>
                <label className="crud-field">
                  Correo electrónico *
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={handleUserFormChange("email")}
                    placeholder="rich@gmail.com"
                    required
                  />
                </label>
                <label className="crud-field">
                  Contraseña *
                  <input
                    type="password"
                    value={userForm.password}
                    onChange={handleUserFormChange("password")}
                    placeholder="••••••••"
                    required
                  />
                </label>
                <label className="crud-field">
                  Nombre para mostrar *
                  <input
                    type="text"
                    value={userForm.displayName}
                    onChange={handleUserFormChange("displayName")}
                    placeholder="Ricardo"
                    required
                  />
                </label>
                <label className="crud-field">
                  Tipo de usuario *
                  <select
                    value={userForm.userType}
                    onChange={handleUserFormNumberChange("userType")}
                    required
                  >
                    <option value={1}>Administrador</option>
                    <option value={2}>Público</option>
                    <option value={3}>Invitado</option>
                  </select>
                </label>
                <label className="crud-field">
                  Rol *
                  <select
                    value={userForm.role}
                    onChange={handleUserFormNumberChange("role")}
                    required
                  >
                    <option value={1}>Administrador</option>
                    <option value={2}>Público</option>
                    <option value={3}>Invitado</option>
                  </select>
                </label>
              </div>
              <div className="user-register-actions">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowRegisterModal(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" disabled={registering}>
                  <UserPlus size={16} />
                  {registering ? "Registrando..." : "Registrar usuario"}
                </Button>
              </div>
              {registerError && (
                <span className="config-error">{registerError}</span>
              )}
              {registerSuccess && (
                <span className="config-success">{registerSuccess}</span>
              )}
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default ConfiguracionSistema;
