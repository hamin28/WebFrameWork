package com.example.demo;

import lombok.Getter;

@Getter
public class CreateMeetingRequest {
    private String title;
    private String category;
    private String description;
    private String placeName;
    private Double latitude;
    private Double longitude;
    private String startsAt;
    private int maxMembers;
}