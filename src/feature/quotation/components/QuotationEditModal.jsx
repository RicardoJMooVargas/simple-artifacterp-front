import QuotationFormPanel from "./QuotationFormPanel";
import QuotationContextView from "./QuotationContextView";

function QuotationEditModal({ contextViewProps, ...formProps }) {
  return (
    <div className="quotes-modal-backdrop">
      <div
        className="quotes-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Editar cotizacion"
        onClick={(event) => event.stopPropagation()}
      >
        <QuotationFormPanel isModal {...formProps} />
        {contextViewProps && (
          <div className="quotes-modal-context">
            <QuotationContextView showControls={false} {...contextViewProps} />
          </div>
        )}
      </div>
    </div>
  );
}

export default QuotationEditModal;
