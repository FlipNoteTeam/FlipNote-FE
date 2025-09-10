import apiClient from "@/shared/apis/fetch";

// Image API 전용 타입들
export interface ImageUploadRequestDto {
  fileName: string;
}

export interface ImageUploadResponseDto {
  url: string;
}

export const imageApi = {
  // 이미지 업로드 URL 생성 (S3 Presigned URL)
  getPresignedUrl: (data: ImageUploadRequestDto) =>
    apiClient.post<ImageUploadResponseDto>("/images/upload", data),
};
