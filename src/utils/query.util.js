exports.normalizeQuery = (queryBuilderResult, customKeys = {}) => {
  const norm = {
    page: queryBuilderResult.pagination?.page || 1,
    limit: queryBuilderResult.pagination?.limit || 10,
    sort: queryBuilderResult.sort || null,
    search: queryBuilderResult.search || null,
    ...queryBuilderResult.filters,
    ...customKeys,
  };

  // Remove empty values for cache stability
  return Object.fromEntries(
    Object.entries(norm).filter(
      ([_, v]) => v !== null && v !== undefined && v !== ""
    )
  );
};
