import SparkMD5 from "spark-md5";

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
