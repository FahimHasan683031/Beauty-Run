import { Request, Response, NextFunction } from 'express';
import multer, { FileFilterCallback } from 'multer';
import ApiError from '../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import path from 'path';
import fs from 'fs';

type IFolderName = 'image' | 'images' | 'media' | 'documents' | 'files';

interface ProcessedFiles {
  [key: string]: string | string[] | undefined;
}

const uploadFields = [
  { name: 'image', maxCount: 1 },
  { name: 'images', maxCount: 10 },
  { name: 'media', maxCount: 3 },
  { name: 'documents', maxCount: 3 },
  { name: 'files', maxCount: 4 },
] as const;

export const fileAndBodyProcessorUsingDiskStorage = () => {
  const uploadsDir = path.join(process.cwd(), 'uploads');

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const folderPath = path.join(uploadsDir, file.fieldname);
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
      cb(null, folderPath);
    },
    filename: (req, file, cb) => {
      const ext =
        path.extname(file.originalname) ||
        `.${file.mimetype.split('/')[1]}`;

      const filename = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}${ext}`;

      cb(null, filename);
    },
  });

  const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ) => {
    const allowedTypes: Record<IFolderName, string[] | null> = {
      image: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
      images: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
      media: ['video/mp4', 'audio/mpeg'],
      documents: ['application/pdf'],
      files: null,
    };

    const fieldType = file.fieldname as IFolderName;
    const allowed = allowedTypes[fieldType];

    if (allowed && !allowed.includes(file.mimetype)) {
      return cb(
        new ApiError(
          StatusCodes.BAD_REQUEST,
          `Invalid file type for ${file.fieldname}`,
        ),
      );
    }

    cb(null, true);
  };

  const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 200 * 1024 * 1024,
      files: 50,
    },
  }).fields(uploadFields);

  return (req: Request, res: Response, next: NextFunction) => {
    upload(req, res, (error) => {
      if (error) return next(error);

      try {
        if (req.body?.data) {
          req.body = JSON.parse(req.body.data);
        }

        if (!req.files) return next();

        const processedFiles: ProcessedFiles = {};

        for (const [fieldName, files] of Object.entries(req.files)) {
          const fileArray = files as Express.Multer.File[];

          const paths = fileArray.map(
            (file) => `/${fieldName}/${file.filename}`,
          );

          processedFiles[fieldName] =
            fileArray.length > 1 ? paths : paths[0];
        }

        req.body = {
          ...req.body,
          ...processedFiles,
        };

        next();
      } catch (err) {
        next(err);
      }
    });
  };
};