export const checkFormat = (str) => {
  const allowedFileFormat = ["image/png", "image/jpeg", "image/jpg"];

  const isImage = new RegExp(allowedFileFormat.join("|"), "i");

  const resMatch = str.match(isImage);

  if (!resMatch) {
    return null;
  }

  const type = `${resMatch[0].split("/")[1]}`;

  return type;
};
