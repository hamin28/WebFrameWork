package com.example.demo;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String userId;

    @Column(nullable = false)
    private String password;

    private String name;
    private String email;
    private String phone;
    private String address;
    private String addressDetail;
    private String introduction;

    public Member(String userId, String password, String name, String email, String phone,
                  String address, String addressDetail) {
        this.userId = userId;
        this.password = password;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.addressDetail = addressDetail;
    }

    public void updateProfile(String name, String address, String addressDetail, String introduction) {
        if (name != null && !name.isBlank()) this.name = name.trim();
        if (address != null) this.address = address.trim();
        if (addressDetail != null) this.addressDetail = addressDetail.trim();
        if (introduction != null) this.introduction = introduction.trim();
    }
}
