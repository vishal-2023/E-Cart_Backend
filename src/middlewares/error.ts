import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/utility-class.js";
import { ControllerType } from "../types/types.js";


  const errorMiddleWare = (err:ErrorHandler,req:Request,res:Response,next:NextFunction) => {
    console.log("err",err)
    err.message ||= "Internal Server Error";
    err.statusCode ||= 500;

    return res.status(err.statusCode).json({
        status:false,
        message:err.message
    })
}

export default errorMiddleWare;


export const TryCatch = (fun:ControllerType) => (req:Request,res:Response,next:NextFunction) => {
    return Promise.resolve(fun(req,res,next)).catch(next)
} 