package com.xala.gym;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication(exclude = { org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class })
@EnableAsync
public class GymXalaSystemApplication {
    public static void main(String[] args) {
        SpringApplication.run(GymXalaSystemApplication.class, args);
    }
}
