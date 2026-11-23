package com.example.demo;

import lombok.Getter;

@Getter
public class MeetingParticipationResponse {
    private final boolean joined;
    private final boolean host;
    private final boolean full;
    private final boolean canJoin;
    private final long currentMembers;
    private final int maxMembers;

    public MeetingParticipationResponse(boolean joined, boolean host, long currentMembers, int maxMembers) {
        this.joined = joined;
        this.host = host;
        this.full = currentMembers >= maxMembers;
        this.canJoin = !joined && !host && !full;
        this.currentMembers = currentMembers;
        this.maxMembers = maxMembers;
    }
}
