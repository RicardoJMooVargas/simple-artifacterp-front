import { Button } from "../../../components/ui/button";

function QuotationFilters({
  error,
  filters,
  filtersReady,
  loading,
  onFilterChange,
  onSearch,
}) {
  return (
    <section className="quotes-panel">
      <h2 className="quotes-panel-title">Filtros</h2>
      <form className="quotes-grid" onSubmit={onSearch}>
        <label className="quotes-field">
          Anio
          <input
            type="number"
            min="2000"
            max="2100"
            value={filters.year}
            onChange={onFilterChange("year")}
          />
        </label>
        <label className="quotes-field">
          Mes
          <input
            type="number"
            min="1"
            max="12"
            value={filters.month}
            onChange={onFilterChange("month")}
          />
        </label>
        <label className="quotes-field">
          Tipo producto
          <input
            type="number"
            value={filters.productType}
            onChange={onFilterChange("productType")}
          />
        </label>
        <label className="quotes-field">
          Estado
          <input
            type="number"
            value={filters.status}
            onChange={onFilterChange("status")}
          />
        </label>
        <label className="quotes-field">
          Busqueda
          <input
            type="text"
            value={filters.search}
            onChange={onFilterChange("search")}
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
  );
}

export default QuotationFilters;
