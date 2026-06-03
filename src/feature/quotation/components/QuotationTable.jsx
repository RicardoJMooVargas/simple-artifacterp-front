import { Button } from "../../../components/ui/button";
import { formatDate } from "../quotationUtils";

function QuotationTable({ currentUser, loading, quotations, onOpenEdit }) {
  return (
    <section className="quotes-panel">
      <div className="quotes-panel-header">
        <h2 className="quotes-panel-title">Tabla de cotizaciones</h2>
        <span className="quotes-panel-meta">{quotations.length} resultados</span>
      </div>
      <div className="quotes-table-container">
        <table className="quotes-table">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>ID</th>
              <th>Titulo</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Tipo</th>
              <th>Editado por</th>
              <th>Accion</th>
            </tr>
          </thead>
          <tbody>
            {quotations.map((item) => (
              <tr key={item.quotationId}>
                <td>
                  {item.images?.[0] ? (
                    <img
                      className="quotes-table-image"
                      src={item.images[0]}
                      alt={item.title}
                    />
                  ) : (
                    <span className="quotes-meta">Sin imagen</span>
                  )}
                </td>
                <td>{item.quotationId}</td>
                <td>{item.title}</td>
                <td>{formatDate(item.date)}</td>
                <td>{item.status}</td>
                <td>{item.productType}</td>
                <td>{currentUser}</td>
                <td>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onOpenEdit(item.quotationId)}
                  >
                    Editar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!quotations.length && !loading && (
        <p className="quotes-empty">Sin cotizaciones para mostrar.</p>
      )}
    </section>
  );
}

export default QuotationTable;
