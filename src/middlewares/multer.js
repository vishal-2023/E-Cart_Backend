import multer from "multer";
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
export const singleUpload = upload.single("photo");
export const mutliUpload = upload.array("photos", 5);
