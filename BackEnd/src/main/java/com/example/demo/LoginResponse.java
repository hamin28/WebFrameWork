package com.example.demo;

import lombok.Getter;

@Getter
public class LoginResponse {
    private String token;
    private String name;

    public LoginResponse(String token, String name) {
        this.token = token;
        this.name = name;
    }
}