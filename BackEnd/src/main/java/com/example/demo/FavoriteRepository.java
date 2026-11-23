package com.example.demo;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByMemberOrderByCreatedAtDesc(Member member);
    Optional<Favorite> findByMemberAndMeeting(Member member, Meeting meeting);
    void deleteByMemberAndMeeting(Member member, Meeting meeting);
}
