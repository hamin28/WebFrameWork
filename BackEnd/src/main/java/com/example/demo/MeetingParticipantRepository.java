package com.example.demo;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MeetingParticipantRepository extends JpaRepository<MeetingParticipant, Long> {
    boolean existsByMeetingAndMember(Meeting meeting, Member member);
    long countByMeeting(Meeting meeting);
    void deleteByMeetingAndMember(Meeting meeting, Member member);
}
