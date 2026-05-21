class QueryBuilder {
  constructor(queryString = {}) {
    this.queryString = queryString;
    this.parsedFilters = {};
    this.parsedSort = null;
    this.parsedPagination = { page: 1, limit: 10, offset: 0 };
    this.parsedAttributes = null;
    this.searchKeyword = null;
  }

  filter(excludedFields = []) {
    const queryObj = { ...this.queryString };

    const defaultExcludedFields = [
      "page",
      "sort",
      "limit",
      "fields",
      "keyword",
      "q",
      "search"
    ];

    const allExcluded = [...defaultExcludedFields, ...excludedFields];
    allExcluded.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.parsedFilters = JSON.parse(queryStr);

    return this;
  }

  sort(defaultSort = [["created_at", "DESC"]]) {
    if (this.queryString.sort) {
      let sortFields = this.queryString.sort;
      if (Array.isArray(sortFields)) {
        sortFields = sortFields.join(",");
      }

      this.parsedSort = sortFields.split(",").map((field) => {
        if (field.includes(":")) {
          const [key, order] = field.split(":");
          return [key, order.toUpperCase() === "DESC" ? "DESC" : "ASC"];
        }
        if (field.startsWith("-")) {
          return [field.substring(1), "DESC"];
        }
        return [field, "ASC"];
      });
    } else {
      this.parsedSort = defaultSort;
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      this.parsedAttributes = this.queryString.fields.split(",");
    } else {
      this.parsedAttributes = null;
    }
    return this;
  }

  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 10;
    const offset = (page - 1) * limit;

    this.parsedPagination = { page, limit, offset };
    return this;
  }

  search(searchFields = ["q", "keyword", "search"]) {
    for (const field of searchFields) {
      if (this.queryString[field]) {
        this.searchKeyword = this.queryString[field];
        break;
      }
    }
    return this;
  }

  normalize() {
    return {
      filters: this.parsedFilters,
      sort: this.parsedSort,
      pagination: this.parsedPagination,
      attributes: this.parsedAttributes,
      search: this.searchKeyword,
    };
  }
}

module.exports = QueryBuilder;
