package com.xala.gym.test;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pt")
public class PtTestController {

    @GetMapping("/test")
    public String testPt() {
        return "PT OK";
    }
}
