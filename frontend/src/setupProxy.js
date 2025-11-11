const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/raon/api",
    createProxyMiddleware({
      target: "http://localhost:8086", // 스프링 포트
      changeOrigin: true,
      secure: false,
    })
  );
};
