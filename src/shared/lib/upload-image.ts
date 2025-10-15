import { imageApi, type IMAGE_UPLOAD_TYPE } from "@/shared/apis";
import axios from "axios";
import SparkMD5 from "spark-md5";

type UploadImageProps = {
  file: File;
  type: IMAGE_UPLOAD_TYPE;
};

export const uploadImage = async ({ file, type }: UploadImageProps) => {
  const fileName = await getFullHashFileName(file);
  const res = await imageApi.getPresignedUrl({ fileName, type });
  const { imageRefId, url } = res.data.data;

  await axios.put(url, file, {
    headers: { "Content-Type": file.type },
  });

  return imageRefId;
};

export const getFullHashFileName = async (file: File) => {
  const fileHash = await getHashName(file);
  const extension = getFileExtension(file);

  return `${fileHash}.${extension}`;
};

export const getHashName = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const spark = new SparkMD5.ArrayBuffer();
  spark.append(arrayBuffer);
  return spark.end();
};

export const getFileExtension = (file: File): string => {
  const fileName = file.name;
  const lastDotIndex = fileName.lastIndexOf(".");
  return lastDotIndex !== -1 ? fileName.slice(lastDotIndex + 1) : "";
};
