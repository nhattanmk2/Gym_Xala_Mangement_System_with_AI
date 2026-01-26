package com.xala.gym;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(exclude = { org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class })
public class GymXalaSystemApplication {
    public static void main(String[] args) {
        SpringApplication.run(GymXalaSystemApplication.class, args);
    }
}
