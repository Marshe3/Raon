package com.example.raon.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserController {
    
    @GetMapping("/")
    public String home() {
        return "안녕하세요! 라온입니다.";
    }
    
}
