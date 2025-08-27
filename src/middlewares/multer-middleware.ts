import multer from "multer";
import path from "path";
const __dirname = import.meta.dirname; 

const storage = multer.diskStorage({
    destination: "photos/",
    filename: (req, file, cb) => {
      const fileExtension = path.extname(file.originalname); // Получаем расширение файла
      const fileName = `${Date.now()}${fileExtension}`; // Уникальное имя файла
      cb(null, fileName); // Генерируем уникальное имя для файла
    }
  });
  

export const upload = multer({ storage: storage });
//export const upload = multer({ storage, fileFilter });