package com.example.demo;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final MeetingRepository meetingRepository;
    private final MeetingParticipantRepository participantRepository;

    @Transactional(readOnly = true)
    public List<MeetingResponse> getFavorites(Member member) {
        return favoriteRepository.findByMemberOrderByCreatedAtDesc(member)
                .stream()
                .map(Favorite::getMeeting)
                .map(meeting -> new MeetingResponse(
                        meeting,
                        participantRepository.countByMeeting(meeting)
                                + (meeting.getHost() == null ? 0 : 1)
                ))
                .toList();
    }

    @Transactional
    public void addFavorite(Member member, Long meetingId) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "모임을 찾을 수 없습니다."));

        if (favoriteRepository.findByMemberAndMeeting(member, meeting).isEmpty()) {
            favoriteRepository.save(new Favorite(member, meeting));
        }
    }

    @Transactional
    public void removeFavorite(Member member, Long meetingId) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "모임을 찾을 수 없습니다."));
        favoriteRepository.deleteByMemberAndMeeting(member, meeting);
    }
}
