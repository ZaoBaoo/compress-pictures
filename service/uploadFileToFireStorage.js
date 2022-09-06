import dotenv from "dotenv";
dotenv.config();

// Firebase
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import {
  getDownloadURL,
  ref,
  uploadBytesResumable,
  listAll,
  deleteObject,
} from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTO_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGINS_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const FIREBASE_APP = initializeApp(firebaseConfig);
const storage = getStorage(FIREBASE_APP);

export const uploadFileToFireStorage = (buffer, type, uid) => {
  return new Promise(async (res, rej) => {
    //
    try {
      const fileName = Date.now().toString();
      const refFolder = ref(storage, `/avatars/${uid}/`);
      const refFile = ref(storage, `/avatars/${uid}/${fileName}.${type}`);

      const list = await listAll(refFolder);

      // Пустая переменная
      let namePhotoForRemove;

      // Проверям есть ли загруженное фото
      // Если есть, то помечаем его
      if (list?.items?.length) {
        namePhotoForRemove = list?.items[0].name;
      }

      const uploadTask = uploadBytesResumable(refFile, buffer, {
        contentType: `image/${type}`,
      });

      uploadTask.on(
        "state_changed",
        (snapshot) => {},
        (err) => {
          console.log(err);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((url) => {
            const removePhoto = () => {
              // Ссылка на файл для удаления
              const refFile = ref(
                storage,
                `/avatars/${uid}/${namePhotoForRemove}`
              );

              deleteObject(refFile).then((data) => {
                res(url);
                return;
              });
            };

            namePhotoForRemove && removePhoto();
            res(url);
          });
        }
      );
    } catch (error) {
      rej(error);
    }
  });
};
