package com.example.demo;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MeetingService {

    private final MeetingRepository meetingRepository;
    private final MeetingParticipantRepository participantRepository;

    public Meeting createMeeting(CreateMeetingRequest request, Member host) {
        Meeting meeting = new Meeting(
                request.getTitle(),
                request.getCategory(),
                request.getDescription(),
                request.getPlaceName(),
                request.getLatitude(),
                request.getLongitude(),
                request.getStartsAt(),
                request.getMaxMembers(),
                host
        );
        return meetingRepository.save(meeting);
    }

    public List<MeetingResponse> findNearby(Double south, Double north, Double west, Double east) {
        return meetingRepository
                .findByLatitudeBetweenAndLongitudeBetween(south, north, west, east)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<MeetingResponse> getMeetings() {
        return meetingRepository.findAll().stream().map(this::toResponse).toList();
    }

    public List<MeetingResponse> findMine(Member host) {
        return meetingRepository.findByHostOrderByIdDesc(host).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public MeetingResponse getMeeting(Long meetingId) {
        return toResponse(findMeeting(meetingId));
    }

    @Transactional(readOnly = true)
    public MeetingParticipationResponse getParticipation(Long meetingId, Member member) {
        Meeting meeting = findMeeting(meetingId);
        return participationResponse(meeting, member);
    }

    @Transactional
    public MeetingParticipationResponse joinMeeting(Long meetingId, Member member) {
        Meeting meeting = findMeeting(meetingId);
        if (isHost(meeting, member)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "내가 만든 모임에는 참여할 수 없습니다.");
        }

        if (participantRepository.existsByMeetingAndMember(meeting, member)) {
            return participationResponse(meeting, member);
        }

        long currentMembers = participantRepository.countByMeeting(meeting);
        if (currentMembers >= meeting.getMaxMembers()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "모임 정원이 마감되었습니다.");
        }

        participantRepository.save(new MeetingParticipant(member, meeting));
        return participationResponse(meeting, member);
    }

    @Transactional
    public MeetingParticipationResponse leaveMeeting(Long meetingId, Member member) {
        Meeting meeting = findMeeting(meetingId);
        participantRepository.deleteByMeetingAndMember(meeting, member);
        return participationResponse(meeting, member);
    }

    private Meeting findMeeting(Long meetingId) {
        return meetingRepository.findById(meetingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "모임을 찾을 수 없습니다."));
    }

    private MeetingResponse toResponse(Meeting meeting) {
        return new MeetingResponse(meeting, participantRepository.countByMeeting(meeting));
    }

    private MeetingParticipationResponse participationResponse(Meeting meeting, Member member) {
        return new MeetingParticipationResponse(
                participantRepository.existsByMeetingAndMember(meeting, member),
                isHost(meeting, member),
                participantRepository.countByMeeting(meeting),
                meeting.getMaxMembers()
        );
    }

    private boolean isHost(Meeting meeting, Member member) {
        return meeting.getHost() != null && meeting.getHost().getId().equals(member.getId());
    }
}
