import SparkMD5 from "spark-md5";

export const getHashName = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const spark = new SparkMD5.ArrayBuffer();
  spark.append(arrayBuffer);
  return spark.end();
};
