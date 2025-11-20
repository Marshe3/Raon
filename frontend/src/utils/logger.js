/**
 * 개발 환경에서만 로그를 출력하는 유틸리티
 * 프로덕션 환경에서는 로그가 출력되지 않음
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  error: (...args) => {
    // 에러는 프로덕션에서도 출력
    console.error(...args);
  },

  info: (...args) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },

  debug: (...args) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  }
};

export default logger;
