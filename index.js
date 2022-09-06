import cors from "cors";
import express from "express";
import fileUpload from "express-fileupload";

import { compressAndResized } from "./service/compressAndResized.js";
import { uploadFileToFireStorage } from "./service/uploadFileToFireStorage.js";
import { checkFormat } from "./service/checkFormat.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(
  fileUpload({
    createParentPath: true,
  })
);

const blockRequest = {};

app.post("/api", async (req, res) => {
  const uid = req.query.uid;

  //   Если клиент не прислал uid | Error
  if (!uid) {
    res.status(400);
    res.json({ message: "Invalid uid" });
    return;
  }

  //   Если клиент не прислал файл | Error
  if (!req.files) {
    res.status(400);
    res.json({ message: "File not found" });
    return;
  }

  //   Если клиент прислал новый запрос, а старый еще не обработан | Error
  if (blockRequest[uid]) {
    res.status(400);
    res.json({ message: "Your previous request is being processed" });
    return;
  }
  //   Блокируем все новые запросы по uid, пока старый не обработан
  blockRequest[uid] = true;

  try {
    const allowedFormat = checkFormat(req.files.image.mimetype);

    if (!allowedFormat) {
      res.status(415);
      res.json({ message: "Bad file format" });
      blockRequest[uid] = false;
      return;
    }

    const bufferImg = await compressAndResized(req.files.image.data);

    const urlImg = await uploadFileToFireStorage(bufferImg, allowedFormat, uid);

    res.status(200);
    res.json({ message: "Image uploaded successfully", url: urlImg });
    blockRequest[uid] = false;
    //
  } catch (error) {
    //
    console.log(error);
    res.status(500);
    res.json({ message: "SERVER_ERROR" });
    blockRequest[uid] = false;
  }
});

app.listen(3838, () => {
  console.log("CORS-enabled web server listening on port 3838");
});
