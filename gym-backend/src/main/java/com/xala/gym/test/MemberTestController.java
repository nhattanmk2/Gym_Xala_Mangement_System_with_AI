package com.xala.gym.test;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/member")
public class MemberTestController {

    @GetMapping("/test")
    public String testMember() {
        return "MEMBER OK";
    }
}