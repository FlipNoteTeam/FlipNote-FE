import apiClient from "@/shared/apis/fetch";

export type IMAGE_UPLOAD_TYPE = "GROUP" | "USER" | "CARD_SET";

// Image API 전용 타입들
export interface ImageUploadRequestDto {
  fileName: string;
  type: IMAGE_UPLOAD_TYPE;
}

export interface ImageUploadResponseDto {
  url: string;
  imageRefId: number;
}

export const imageApi = {
  // 이미지 업로드 URL 생성 (S3 Presigned URL)
  getPresignedUrl: (data: ImageUploadRequestDto) =>
    apiClient.post<ImageUploadResponseDto>("/images/upload", data),
};
