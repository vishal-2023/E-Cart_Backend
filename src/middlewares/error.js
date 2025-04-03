const errorMiddleWare = (err, req, res, next) => {
    console.log("err", err);
    err.message || (err.message = "Internal Server Error");
    err.statusCode || (err.statusCode = 500);
    return res.status(err.statusCode).json({
        status: false,
        message: err.message
    });
};
export default errorMiddleWare;
export const TryCatch = (fun) => (req, res, next) => {
    return Promise.resolve(fun(req, res, next)).catch(next);
};
