package com.example.demo;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;
    private final JwtUtil jwtUtil;
    private final CurrentMemberService currentMemberService;

    @PostMapping("/api/signup")
    public String signup(@RequestBody SignupRequest request) {
        memberService.signup(request);
        return "회원가입 성공";
    }

    @GetMapping("/api/check-userid")
    public boolean checkUserId(@RequestParam String userId){
        return memberService.isUserIdDuplicate(userId);
    }

    @PostMapping("/api/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        Member member = memberService.login(request);
        String token = jwtUtil.createToken(member.getUserId());
        return new LoginResponse(token, member.getName());
    }

    @GetMapping("/api/members/me")
    public ProfileResponse getMyProfile(@RequestHeader(value = "Authorization", required = false) String authorization) {
        return new ProfileResponse(currentMemberService.requireMember(authorization));
    }

    @PatchMapping("/api/members/me")
    public ProfileResponse updateMyProfile(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody ProfileUpdateRequest request) {
        Member currentMember = currentMemberService.requireMember(authorization);
        return new ProfileResponse(memberService.updateProfile(currentMember.getUserId(), request));
    }
}
