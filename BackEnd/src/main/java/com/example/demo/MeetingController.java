package com.example.demo;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequiredArgsConstructor
public class MeetingController {

    private final MeetingService meetingService;
    private final CurrentMemberService currentMemberService;

    @PostMapping(value = "/api/meetings", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, Object> createMeeting(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestPart("meeting") CreateMeetingRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        Meeting saved = meetingService.createMeeting(request, currentMemberService.requireMember(authorization));
        return Map.of("id", saved.getId());
    }

    @GetMapping("/api/meetings/nearby")
    public List<MeetingResponse> nearby(
            @RequestParam Double south,
            @RequestParam Double north,
            @RequestParam Double west,
            @RequestParam Double east) {
        return meetingService.findNearby(south, north, west, east);
    }

    @GetMapping("/api/meetings/mine")
    public List<MeetingResponse> mine(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        return meetingService.findMine(currentMemberService.requireMember(authorization));
    }

    @GetMapping("/api/meetings/{meetingId}")
    public MeetingResponse getMeeting(@PathVariable Long meetingId) {
        return meetingService.getMeeting(meetingId);
    }

    @GetMapping("/api/meetings/{meetingId}/participation")
    public MeetingParticipationResponse getParticipation(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long meetingId) {
        return meetingService.getParticipation(meetingId, currentMemberService.requireMember(authorization));
    }

    @PostMapping("/api/meetings/{meetingId}/participation")
    public MeetingParticipationResponse joinMeeting(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long meetingId) {
        return meetingService.joinMeeting(meetingId, currentMemberService.requireMember(authorization));
    }

    @DeleteMapping("/api/meetings/{meetingId}/participation")
    public MeetingParticipationResponse leaveMeeting(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long meetingId) {
        return meetingService.leaveMeeting(meetingId, currentMemberService.requireMember(authorization));
    }

    @GetMapping("/api/meetings")
    public List<MeetingResponse> getMeetings() {
        return meetingService.getMeetings();
    }
}
