package com.example.demo;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MeetingService {

    private final MeetingRepository meetingRepository;
    private final MeetingParticipantRepository participantRepository;
    private final FavoriteRepository favoriteRepository;
    private final MeetingImageStorageService imageStorageService;

    public Meeting createMeeting(CreateMeetingRequest request, Member host, List<MultipartFile> images) {
        Meeting meeting=new Meeting(request.getTitle(),request.getCategory(),request.getDescription(),request.getPlaceName(),request.getLatitude(),request.getLongitude(),request.getStartsAt(),request.getMaxMembers(),host);
        Meeting saved=meetingRepository.save(meeting);saved.setImageUrls(imageStorageService.saveImages(images));return meetingRepository.save(saved);
    }

    @Transactional(readOnly = true)
    public List<MeetingResponse> findNearby(Double south, Double north, Double west, Double east, String keyword) {
        // 공백으로 나눈 단어가 모두 (제목/설명/카테고리/장소) 중 어딘가에 들어 있어야 검색됩니다.
        String[] words = keyword == null || keyword.isBlank()
                ? new String[0]
                : keyword.trim().toLowerCase().split("\\s+");

        return meetingRepository
                .findByLatitudeBetweenAndLongitudeBetween(south, north, west, east)
                .stream()
                .filter(meeting -> matchesAll(meeting, words))
                .map(this::toResponse)
                .toList();
    }

    private boolean matchesAll(Meeting meeting, String[] words) {
        String text = String.join(" ",
                nullToEmpty(meeting.getTitle()),
                nullToEmpty(meeting.getDescription()),
                nullToEmpty(meeting.getCategory()),
                nullToEmpty(meeting.getPlaceName())).toLowerCase();
        for (String word : words) {
            if (!text.contains(word)) return false;
        }
        return true;
    }

    private String nullToEmpty(String value) {
        return value == null ? "" : value;
    }

    @Transactional(readOnly = true)
    public List<MeetingResponse> getMeetings() {
        return meetingRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<MeetingResponse> findMine(Member host) {
        return meetingRepository.findByHostOrderByIdDesc(host).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<MeetingResponse> findParticipating(Member member) {
        return participantRepository.findByMemberOrderByIdDesc(member).stream()
                .map(MeetingParticipant::getMeeting)
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public MeetingResponse getMeeting(Long meetingId) {
        return toResponse(findMeeting(meetingId));
    }

    @Transactional
    public void deleteMeeting(Long meetingId, Member member) {
        Meeting meeting = findMeeting(meetingId);
        if (!isHost(meeting, member)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "방장만 모임을 삭제할 수 있습니다.");
        }

        List<String> imageUrls = meeting.getImageUrls() == null
                ? List.of()
                : List.copyOf(meeting.getImageUrls());
        participantRepository.deleteByMeeting(meeting);
        favoriteRepository.deleteByMeeting(meeting);
        meetingRepository.delete(meeting);
        meetingRepository.flush();

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                imageStorageService.deleteImages(imageUrls);
            }
        });
    }

    @Transactional
    public MeetingResponse confirmMeeting(Long meetingId, Member member, String announcement) {
        Meeting meeting = findMeeting(meetingId);
        if (!isHost(meeting, member)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "방장만 모임을 확정할 수 있습니다.");
        if (meeting.isConfirmed()) throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 확정된 모임입니다.");
        if (announcement == null || announcement.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "공지 내용을 입력해 주세요.");
        meeting.confirm(announcement.trim());
        return toResponse(meeting);
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

        long currentMembers = countCurrentMembers(meeting);
        if (currentMembers >= meeting.getMaxMembers()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "모임 정원이 마감되었습니다.");
        }

if (meeting.isConfirmed()) throw new ResponseStatusException(HttpStatus.CONFLICT, "모임이 확정되어 참가 신청이 마감됐습니다.");
        participantRepository.save(new MeetingParticipant(member, meeting));
        return participationResponse(meeting, member);
    }

    @Transactional
    public MeetingParticipationResponse leaveMeeting(Long meetingId, Member member) {
        Meeting meeting = findMeeting(meetingId);
        participantRepository.deleteByMeetingAndMember(meeting, member);
        participantRepository.flush();
        return participationResponse(meeting, member);
    }

    private Meeting findMeeting(Long meetingId) {
        return meetingRepository.findById(meetingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "모임을 찾을 수 없습니다."));
    }

    private MeetingResponse toResponse(Meeting meeting) {
        return new MeetingResponse(meeting, countCurrentMembers(meeting));
    }

    long countCurrentMembers(Meeting meeting) {
        long hostCount = meeting.getHost() == null ? 0 : 1;
        return participantRepository.countByMeeting(meeting) + hostCount;
    }

    private MeetingParticipationResponse participationResponse(Meeting meeting, Member member) {
        return new MeetingParticipationResponse(
                participantRepository.existsByMeetingAndMember(meeting, member),
                isHost(meeting, member), countCurrentMembers(meeting), meeting.getMaxMembers(),
                meeting.isConfirmed(), meeting.getAnnouncement());
    }

    private boolean isHost(Meeting meeting, Member member) {
        return meeting.getHost() != null && meeting.getHost().getId().equals(member.getId());
    }
}
