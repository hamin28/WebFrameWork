package com.example.demo;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;

    public void signup(SignupRequest request) {

        // 1. 아이디 중복 확인
        if (memberRepository.findByUserId(request.getUserId()).isPresent()) {
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        }

        // 2. 비밀번호와 비밀번호 확인이 같은지 확인
        if (!request.getPassword().equals(request.getPasswordConfirm())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        // 3. Member 만들기
        Member member = new Member(
                request.getUserId(),
                request.getPassword(),
                request.getName(),
                request.getEmail(),
                request.getPhone(),
                request.getAddress(),
                request.getAddressDetail()
        );

        // 4. DB에 저장
        memberRepository.save(member);
    }


    public boolean isUserIdDuplicate(String userId) {
        return memberRepository.findByUserId(userId).isPresent();
    }

    public Member login(LoginRequest request){
        Member member = memberRepository.findByUserId(request.getUserId()).orElseThrow(() -> new IllegalArgumentException("존재하지 않는 아이디입니다."));

        if(!member.getPassword().equals(request.getPassword())){
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        return member;
    }

    public Member updateProfile(String userId, ProfileUpdateRequest request) {
        Member member = memberRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다."));
        member.updateProfile(
                request.getName(),
                request.getAddress(),
                request.getAddressDetail(),
                request.getIntroduction(),
                request.getMapLocationAddress(),
                request.getLocationLatitude(),
                request.getLocationLongitude()
        );
        return memberRepository.save(member);
    }


}
