package com.example.raon;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching  
public class RaonApplication {
    public static void main(String[] args) {
        SpringApplication.run(RaonApplication.class, args);
    }
}
