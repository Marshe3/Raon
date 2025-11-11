// src/main/java/com/example/raon/config/WebConfig.java
package com.example.raon.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

  @Override
  public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/**")
        .allowedOrigins("http://localhost:3000", "http://localhost:5173")
        .allowedMethods("GET","POST","PUT","PATCH","DELETE","OPTIONS")   // 👈 추가
        .allowedHeaders("Authorization","Content-Type","X-XSRF-TOKEN")
        .exposedHeaders("X-XSRF-TOKEN")
        .allowCredentials(true)
        .maxAge(3600);
  }
}
