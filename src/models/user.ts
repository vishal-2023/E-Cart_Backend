import mongoose,{Schema} from "mongoose";

interface IUser extends Document {
    name: string;
    email: string;
    password:string;
    photo: string;
    role: "admin" | "user";
    gender: "male" | "female";
    dob: Date;
    createdAt: Date;
    updatedAt: Date;
    age: number;
  }
  

const schema = new Schema(
    {
      name: {
        type: String,
        required: [true, "Please enter Name"],
      },
      email: {
        type: String,
        unique: [true, "Email already Exist"],
        required: [true, "Please enter Name"],
      },
      password: { type: String, required: true },
      photo: {
        type: String,
        required:false
      },
      role: {
        type: String,
        enum: ["admin", "user","DELIVERY"],
        default: "user",
      },
      gender: {
        type: String,
        enum: ["male", "female"],
        // required: [true, "Please enter Gender"],
      },
      dob: {
        type: Date,
        // required: [true, "Please enter Date of birth"],
      },
    },
    {
      timestamps: true,
    }
  );

  // schema.virtual("age").get(function () {
  //   const today = new Date();
  //   const dob = this.dob;
  //   let age = today.getFullYear() - dob.getFullYear();
  
  //   if (
  //     today.getMonth() < dob.getMonth() ||
  //     (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
  //   ) {
  //     age--;
  //   }
  
  //   return age;
  // });
  
  export const User = mongoose.model<IUser>("User", schema);