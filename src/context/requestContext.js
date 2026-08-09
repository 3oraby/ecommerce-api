const { AsyncLocalStorage } = require("node:async_hooks");

const requestContext = new AsyncLocalStorage();

const getRequestContext = () => {
    return requestContext.getStore();
};

const setRequestContext = (data) => {
    const context = requestContext.getStore();

    if (context) {
        Object.assign(context, data);
    }
};

module.exports = {
    requestContext,
    getRequestContext,
    setRequestContext,
};