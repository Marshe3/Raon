package com.example.raon.controller;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * SPA (Single Page Application) 라우팅을 위한 컨트롤러
 * React Router의 클라이언트 사이드 라우팅을 지원하기 위해
 * 404 에러를 index.html로 포워딩합니다.
 */
@Controller
public class SpaController implements ErrorController {

    /**
     * 404 에러 발생 시 index.html로 포워딩
     * 이를 통해 React Router가 클라이언트에서 라우팅을 처리할 수 있습니다.
     */
    @RequestMapping("/error")
    public String handleError() {
        return "forward:/index.html";
    }
}
