exports.formatPaginatedResponse = ({ totalItems, page, limit, data }) => {
  const totalPages = Math.ceil(totalItems / limit);
  
  return {
    totalItems,
    totalPages,
    currentPage: page,
    limit,
    totalItemsInCurrentPage: data.length,
    data,
  };
};
