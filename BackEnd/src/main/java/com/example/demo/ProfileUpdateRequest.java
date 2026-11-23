package com.example.demo;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ProfileUpdateRequest {
    private String name;
    private String address;
    private String addressDetail;
    private String introduction;
}
