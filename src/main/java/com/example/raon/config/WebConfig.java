// src/main/java/com/example/raon/config/WebConfig.java
package com.example.raon.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Spring MVC 설정
 * CORS 설정은 SecurityConfig에서 관리
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {
  // CORS 설정은 SecurityConfig에서 통합 관리
}
