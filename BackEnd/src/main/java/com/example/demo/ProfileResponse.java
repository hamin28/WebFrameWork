package com.example.demo;

import lombok.Getter;

@Getter
public class ProfileResponse {
    private final String userId;
    private final String name;
    private final String email;
    private final String phone;
    private final String address;
    private final String addressDetail;
    private final String introduction;
    private final String mapLocationAddress;
    private final Double locationLatitude;
    private final Double locationLongitude;

    public ProfileResponse(Member member) {
        this.userId = member.getUserId();
        this.name = member.getName();
        this.email = member.getEmail();
        this.phone = member.getPhone();
        this.address = member.getAddress();
        this.addressDetail = member.getAddressDetail();
        this.introduction = member.getIntroduction();
        this.mapLocationAddress = member.getMapLocationAddress();
        this.locationLatitude = member.getLocationLatitude();
        this.locationLongitude = member.getLocationLongitude();
    }
}
