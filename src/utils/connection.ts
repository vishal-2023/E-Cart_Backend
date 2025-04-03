// import { //  $0 } from "io//  $0";
import mongoose from "mongoose";

// export const connect//  $0 = (//  $0URI: string) => {
//     const //  $0 = new //  $0(//  $0URI);

//     //  $0.on("connect", () => console.log("//  $0 Connected"));
//     //  $0.on("error", (e) => console.log(e));

//     return //  $0;
// };

export const connectDB = () => {
    // console.log("firstooo",uri)
    mongoose
        .connect(`${process.env.MONGOURI}`)
        .then(() => console.log(`DB Connected successfully`))
        .catch((e) => {
            console.log(e);
            process.exit(1);
        });
};