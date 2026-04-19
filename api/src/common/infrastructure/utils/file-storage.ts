import multer from 'multer';
import * as path from 'path';

export const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', '..', 'uploads'));
  },
  // filename: (req, file, cb) => {
  //   cb(
  //     null,
  //     `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
  //   );
  // },
});
