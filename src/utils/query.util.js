exports.normalizeQuery = (queryBuilderResult, customKeys = {}) => {
  const norm = {
    page: queryBuilderResult.pagination?.page || 1,

    limit: queryBuilderResult.pagination?.limit || 10,

    sort: queryBuilderResult.sort
      ? queryBuilderResult.sort
          .map(([field, dir]) => `${field}_${dir}`)
          .join(",")
      : null,

    search: queryBuilderResult.search || null,

    fields: queryBuilderResult.attributes
      ? queryBuilderResult.attributes.join(",")
      : null,

    ...queryBuilderResult.filters,

    ...customKeys,
  };

  return Object.fromEntries(
    Object.entries(norm).filter(
      ([_, v]) => v !== null && v !== undefined && v !== "",
    ),
  );
};

exports.normalizeRequestQuery = (query = {}, customKeys = {}) => {
  const norm = {
    ...query,
    ...customKeys,
  };

  return Object.fromEntries(
    Object.entries(norm)
      .filter(([_, v]) => v !== null && v !== undefined && v !== "")
      .sort(([a], [b]) => a.localeCompare(b)),
  );
};
