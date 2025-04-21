package com.ssafy.usedtrade.domain.auth.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.usedtrade.common.jwt.JwtTokenProvider;
import com.ssafy.usedtrade.domain.auth.dto.response.KakaoOAuth2Response;
import com.ssafy.usedtrade.domain.auth.dto.response.LoginResponse;
import com.ssafy.usedtrade.domain.auth.entity.SecurityMemberDetails;
import com.ssafy.usedtrade.domain.user.entity.User;
import com.ssafy.usedtrade.domain.user.repository.UserRepository;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
@RequiredArgsConstructor
public class KakaoOAuthService {

    private final UserRepository userRepository;

    @Value("${spring.security.oauth2.client.provider.kakao.user-info-uri}")
    private String KAKAO_USER_INFO_URL;

    private final RestTemplate restTemplate = new RestTemplate();
    private final JwtTokenProvider tokenProvider;

    public LoginResponse socialLogin(String accessToken) {
        KakaoOAuth2Response attributes = getUserInfoFromKakao(accessToken);
        return createMemberAndCreateJwt(attributes);
    }

    private LoginResponse createMemberAndCreateJwt(KakaoOAuth2Response attributes) {
        String email = attributes.email();
        boolean exists = userRepository.existsByEmail(email);

        User member = userRepository.findByEmail(email)
                .orElseGet(() -> userRepository.save(
                        User.createUser(email, attributes.nickName())));

        SecurityMemberDetails principal = new SecurityMemberDetails(member);
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                principal, null
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        return new LoginResponse(
                tokenProvider.createAccessToken(authentication),
                tokenProvider.createRefreshToken(authentication),
                tokenProvider.getExpiration(),
                !exists
        );
    }

    private KakaoOAuth2Response getUserInfoFromKakao(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> request = new HttpEntity<>(headers);
        ResponseEntity<String> response = restTemplate.exchange(
                KAKAO_USER_INFO_URL, HttpMethod.GET, request, String.class
        );

        if (response.getStatusCode() == HttpStatus.OK) {
            return parseKakaoResponse(response.getBody());
        } else {
            throw new RuntimeException("카카오 사용자 정보 조회 실패");
        }
    }

    public KakaoOAuth2Response parseKakaoResponse(String jsonResponse) {
        System.out.println(jsonResponse);

        ObjectMapper objectMapper = new ObjectMapper();

        try {
            Map<String, Object> attributes = objectMapper.readValue(
                    jsonResponse, new TypeReference<Map<String, Object>>() {
                    }
            );
            return KakaoOAuth2Response.from(attributes);
        } catch (Exception e) {
            throw new RuntimeException("올바르지 않습니다", e);
        }
    }

}


