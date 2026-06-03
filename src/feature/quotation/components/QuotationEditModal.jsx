import QuotationFormPanel from "./QuotationFormPanel";

function QuotationEditModal(props) {
  return (
    <div className="quotes-modal-backdrop">
      <div
        className="quotes-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Editar cotizacion"
        onClick={(event) => event.stopPropagation()}
      >
        <QuotationFormPanel isModal {...props} />
      </div>
    </div>
  );
}

export default QuotationEditModal;
