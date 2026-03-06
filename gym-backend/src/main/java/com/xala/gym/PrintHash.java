package com.xala.gym;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PrintHash {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        System.out.println("BCRYPT_HASH_START");
        System.out.println(encoder.encode("password123"));
        System.out.println("BCRYPT_HASH_END");
    }
}
