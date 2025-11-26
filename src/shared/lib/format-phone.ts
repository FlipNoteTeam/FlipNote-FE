/**
 * 전화번호 포맷팅 유틸리티
 */

/**
 * 숫자만 추출
 */
export const extractNumbers = (value: string): string => {
  return value.replace(/[^0-9]/g, "");
};

/**
 * 전화번호를 010-xxxx-xxxx 또는 010-xxx-xxxx 형태로 포맷팅
 */
export const formatPhoneNumber = (value: string): string => {
  const numbers = extractNumbers(value);

  // 길이에 따라 포맷팅
  if (numbers.length <= 3) {
    return numbers;
  } else if (numbers.length <= 7) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  } else if (numbers.length <= 10) {
    // 010-xxx-xxxx 형태
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`;
  } else {
    // 010-xxxx-xxxx 형태
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  }
};

/**
 * 포맷팅된 전화번호를 순수 숫자로 변환 (API 전송용)
 */
export const unformatPhoneNumber = (value: string): string => {
  return extractNumbers(value);
};
