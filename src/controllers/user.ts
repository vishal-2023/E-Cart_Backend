import { NextFunction, Request, Response } from 'express';
import { NewUserRequestBody } from '../types/types.js';

export const newUser = async (req:Request<{},{},NewUserRequestBody>,res:Response,next:NextFunction) => {
    try{
        const {name,email,photo,gender,dob,_id,role} = req.body;
        return res.status(200).json({
            status:true,
            message:"User created sucessfully !!"
        })
    }catch(error){

    }
}