package com.example.demo;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MeetingRepository extends JpaRepository<Meeting, Long> {
    List<Meeting> findByLatitudeBetweenAndLongitudeBetween(
            Double south, Double north, Double west, Double east);

    List<Meeting> findByHostOrderByIdDesc(Member host);
}