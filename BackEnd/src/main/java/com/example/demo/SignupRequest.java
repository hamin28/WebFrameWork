package com.example.demo;

import lombok.Getter;

@Getter
public class SignupRequest {
    private String userId;
    private String password;
    private String passwordConfirm;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String addressDetail;
}
