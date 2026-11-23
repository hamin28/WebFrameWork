package com.example.demo;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;
    private final CurrentMemberService currentMemberService;

    @GetMapping("/api/favorites")
    public List<MeetingResponse> getFavorites(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        return favoriteService.getFavorites(currentMemberService.requireMember(authorization));
    }

    @PostMapping("/api/favorites/{meetingId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void addFavorite(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long meetingId) {
        favoriteService.addFavorite(currentMemberService.requireMember(authorization), meetingId);
    }

    @DeleteMapping("/api/favorites/{meetingId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeFavorite(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long meetingId) {
        favoriteService.removeFavorite(currentMemberService.requireMember(authorization), meetingId);
    }
}
