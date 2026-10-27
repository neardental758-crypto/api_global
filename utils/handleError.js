const httpError = (res, message = 'algo salio mal', code = 500) => {
    if (res && !res.headersSent) {
        res.status(code).send(message);
    }
};

module.exports = { 
    httpError,
    handleHttpError: httpError
};