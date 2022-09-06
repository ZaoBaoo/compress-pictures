import tinify from 'tinify';
import dotenv from 'dotenv';
dotenv.config()

tinify.key = process.env.TINYPNG_API_KEY;

export const compressAndResized = (file) => {
    return new Promise((res, rej) => {
        const source = tinify.fromBuffer(file);
        const resized = source.resize({
            method: "cover",
            width: 300,
            height: 300,
        });

        resized.toBuffer()
            .then(data => res(data))
            .catch(err => console.log(err))
    })
}