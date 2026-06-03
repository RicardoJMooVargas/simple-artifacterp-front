import QuotationFilters from "./QuotationFilters";
import QuotationTable from "./QuotationTable";

function QuotationListView({
  currentUser,
  error,
  filters,
  filtersReady,
  loading,
  quotations,
  onFilterChange,
  onOpenEdit,
  onSearch,
}) {
  return (
    <>
      <QuotationFilters
        error={error}
        filters={filters}
        filtersReady={filtersReady}
        loading={loading}
        onFilterChange={onFilterChange}
        onSearch={onSearch}
      />
      <QuotationTable
        currentUser={currentUser}
        loading={loading}
        quotations={quotations}
        onOpenEdit={onOpenEdit}
      />
    </>
  );
}

export default QuotationListView;
