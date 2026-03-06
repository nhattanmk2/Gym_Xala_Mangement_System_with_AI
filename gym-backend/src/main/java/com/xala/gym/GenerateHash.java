package com.xala.gym;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.nio.file.Files;
import java.nio.file.Paths;

public class GenerateHash {
    public static void main(String[] args) throws Exception {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String hash = encoder.encode("password123");
        Files.write(Paths.get("e:/gym-xala/hash_java.txt"), hash.getBytes());
    }
}
