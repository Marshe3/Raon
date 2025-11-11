// src/main/java/com/example/raon/controller/PersoProxyController.java
package com.example.raon.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ServerWebInputException;
import org.springframework.core.ParameterizedTypeReference;

import reactor.core.publisher.Mono;

import java.net.URI;
import java.util.Collections;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/perso")
@RequiredArgsConstructor
public class PersoProxyController {

    private final WebClient webClient;

    @Value("${perso.base-url:https://api.perso.ai}")
    private String persoBaseUrl;

    @PostMapping("/proxy/**")
    public Mono<Map<String, Object>> proxyPost(
            @RequestBody(required = false) Map<String, Object> body,
            @RequestHeader HttpHeaders headers
    ) {
        // 예시로 세션 생성 엔드포인트로 프록시
        String target = persoBaseUrl + "/v1/session/";
        log.debug("Proxy POST -> {}", target);

        return webClient
                .method(HttpMethod.POST)
                .uri(URI.create(target))
                .headers(h -> {
                    h.setAll(headers.toSingleValueMap());
                    h.setContentType(MediaType.APPLICATION_JSON);
                })
                .bodyValue(body == null ? Collections.emptyMap() : body)
                .retrieve()
                .onStatus(
                        HttpStatusCode::is4xxClientError,
                        r -> Mono.error(new ServerWebInputException("Upstream 4xx"))
                )
                .onStatus(
                        HttpStatusCode::is5xxServerError,
                        r -> Mono.error(new IllegalStateException("Upstream 5xx"))
                )
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {});
    }
}
