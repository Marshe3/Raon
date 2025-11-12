package com.example.raon.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.encrypt.Encryptors;
import org.springframework.security.crypto.encrypt.TextEncryptor;

@Configuration
public class EncryptionConfig {

    @Value("${encryption.password}")
    private String password;

    @Value("${encryption.salt}")
    private String salt;

    @Bean
    public TextEncryptor textEncryptor() {
        // AES-256 암호화를 제공하는 표준 암호화 객체를 생성합니다.
        return Encryptors.text(password, salt);
    }
}
