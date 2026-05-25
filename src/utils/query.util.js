exports.normalizeQuery = (queryBuilderResult, customKeys = {}) => {
  console.log("queryBuilderResult: ", queryBuilderResult);
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
