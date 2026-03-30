package com.xala.gym.security.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtService {

    // ✅ ĐƯA RA FILE CONFIG
    @Value("${jwt.secret-key}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long expiration;

    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration;

    // ================== EXTRACT ==================
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    public <T> T extractClaim(
            String token,
            Function<Claims, T> resolver
    ) {
        final Claims claims = extractAllClaims(token);
        return resolver.apply(claims);
    }

    // ================== GENERATE TOKEN ==================
    // ⚠️ GIỮ LẠI METHOD CŨ (KHÔNG PHÁ CODE)
    public String generateToken(UserDetails userDetails) {
        return generateToken(userDetails, null);
    }

    // ✅ METHOD MỚI – CÓ ROLE (DÙNG CHO LOGIN)
    public String generateToken(
            UserDetails userDetails,
            String role
    ) {
        return buildToken(userDetails, role, expiration);
    }

    public String generateRefreshToken(UserDetails userDetails) {
        return buildToken(userDetails, null, refreshExpiration);
    }

    private String buildToken(
            UserDetails userDetails,
            String role,
            long expirationTime
    ) {
        var builder = Jwts.builder()
                .setSubject(userDetails.getUsername());
        
        if (role != null) {
            builder.claim("role", role);
        }

        return builder
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(
                        new Date(System.currentTimeMillis() + expirationTime)
                )
                .signWith(getSignKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // ================== VALIDATE ==================
    public boolean isTokenValid(
            String token,
            UserDetails userDetails
    ) {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername())
                && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // ================== INTERNAL ==================
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSignKey() {
        byte[] keyBytes =
                Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
