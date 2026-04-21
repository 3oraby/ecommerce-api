class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields", "keyword"];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.parsedFilters = JSON.parse(queryStr);
    
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      this.parsedSort = this.queryString.sort.split(",").map((field) => {
        if (field.startsWith("-")) {
          return [field.substring(1), "DESC"];
        }
        return [field, "ASC"];
      });
    } else {
      this.parsedSort = [["created_at", "DESC"]]; // Default
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      this.parsedAttributes = this.queryString.fields.split(",");
    } else {
      this.parsedAttributes = null; // null means all attributes
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 10;
    const offset = (page - 1) * limit;

    this.parsedPagination = { limit, offset };
    return this;
  }
}

module.exports = ApiFeatures;
