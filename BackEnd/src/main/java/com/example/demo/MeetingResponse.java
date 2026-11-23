package com.example.demo;

import lombok.Getter;

@Getter
public class MeetingResponse {
    private Long id;
    private String title;
    private String category;
    private String description;
    private String placeName;
    private Double latitude;
    private Double longitude;
    private String startsAt;
    private int maxMembers;
    private Long currentMembers;

    public MeetingResponse(Meeting meeting) {
        this(meeting, null);
    }

    public MeetingResponse(Meeting meeting, Long currentMembers) {
        this.id = meeting.getId();
        this.title = meeting.getTitle();
        this.category = meeting.getCategory();
        this.description = meeting.getDescription();
        this.placeName = meeting.getPlaceName();
        this.latitude = meeting.getLatitude();
        this.longitude = meeting.getLongitude();
        this.startsAt = meeting.getStartsAt();
        this.maxMembers = meeting.getMaxMembers();
        this.currentMembers = currentMembers;
    }
}
