package com.example.demo;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MeetingParticipantRepository extends JpaRepository<MeetingParticipant, Long> {
    boolean existsByMeetingAndMember(Meeting meeting, Member member);
    long countByMeeting(Meeting meeting);
    List<MeetingParticipant> findByMemberOrderByIdDesc(Member member);
    void deleteByMeetingAndMember(Meeting meeting, Member member);
    void deleteByMeeting(Meeting meeting);
}
