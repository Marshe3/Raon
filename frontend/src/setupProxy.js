const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/raon/api",
    createProxyMiddleware({
      target: "http://localhost:8086", // 스프링 포트
      changeOrigin: true,
      secure: false,
      // pathRewrite 제거 - 백엔드 context-path가 /raon이므로 그대로 전달
    })
  );
};
