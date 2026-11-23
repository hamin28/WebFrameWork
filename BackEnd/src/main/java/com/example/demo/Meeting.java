package com.example.demo;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
public class Meeting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String category;

    @Column(length = 300)
    private String description;

    private String placeName;
    private Double latitude;
    private Double longitude;
    private String startsAt;
    private int maxMembers;

    @ManyToOne(fetch = FetchType.LAZY)
    private Member host;   // 주최자

    public Meeting(String title, String category, String description,
                   String placeName, Double latitude, Double longitude,
                   String startsAt, int maxMembers, Member host) {
        this.title = title;
        this.category = category;
        this.description = description;
        this.placeName = placeName;
        this.latitude = latitude;
        this.longitude = longitude;
        this.startsAt = startsAt;
        this.maxMembers = maxMembers;
        this.host = host;
    }
}