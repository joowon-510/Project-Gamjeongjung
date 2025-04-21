package com.ssafy.usedtrade.domain.auth.service;

import com.ssafy.usedtrade.domain.auth.dto.response.KakaoOAuth2Response;
import com.ssafy.usedtrade.domain.auth.dto.response.OAuth2Response;
import com.ssafy.usedtrade.domain.auth.entity.SecurityMemberDetails;
import com.ssafy.usedtrade.domain.user.entity.User;
import com.ssafy.usedtrade.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2UserService<OAuth2UserRequest, OAuth2User> delegate = new DefaultOAuth2UserService();
        OAuth2User oAuth2User = delegate.loadUser(userRequest);

        OAuth2Response extractAttributes = KakaoOAuth2Response.from(oAuth2User.getAttributes());

        return createMemberDetails(extractAttributes);
    }

    private SecurityMemberDetails createMemberDetails(
            OAuth2Response extractAttributes
    ) {
        String email = extractAttributes.email();

        User member = userRepository.findByEmail(email)
                .orElseGet(() -> userRepository.save(
                                User.createUser(extractAttributes.email(), extractAttributes.nickName())
                        )
                );

        return new SecurityMemberDetails(member);
    }
}


