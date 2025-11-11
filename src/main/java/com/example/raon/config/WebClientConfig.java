package com.example.raon.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.codec.ClientCodecConfigurer;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Bean
    public WebClient webClient() {
        ExchangeStrategies strategies = ExchangeStrategies.builder()
            .codecs((ClientCodecConfigurer config) -> {
                // 20MB
                config.defaultCodecs().maxInMemorySize(20 * 1024 * 1024);
            })
            .build();

        return WebClient.builder()
            .exchangeStrategies(strategies)
            .build();
    }
}
