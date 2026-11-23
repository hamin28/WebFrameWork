package com.example.demo;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "meeting_participants",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_meeting_participant_member_meeting",
                columnNames = {"member_id", "meeting_id"}
        )
)
@Getter
@NoArgsConstructor
public class MeetingParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "meeting_id", nullable = false)
    private Meeting meeting;

    @Column(nullable = false)
    private LocalDateTime joinedAt;

    public MeetingParticipant(Member member, Meeting meeting) {
        this.member = member;
        this.meeting = meeting;
        this.joinedAt = LocalDateTime.now();
    }
}
