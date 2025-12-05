import fs from "fs";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import { ApiError } from "./ApiError";
import { Request } from "express";

export const makeUploader = (folder: string) => {
  const uploadDir = path.join(__dirname, "..", "..", "public", folder);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      const uniqueName =
        Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;

      cb(null, uniqueName);
    },
  });

  const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

    if (!allowed.includes(file.mimetype)) {
      return cb(new ApiError(400, "Only image files are allowed!"));
    }

    cb(null, true);
  };

  return multer({
    storage,
    fileFilter,
  });
};

// Create uploader per folder
export const sampleUpload = makeUploader("folderName");
