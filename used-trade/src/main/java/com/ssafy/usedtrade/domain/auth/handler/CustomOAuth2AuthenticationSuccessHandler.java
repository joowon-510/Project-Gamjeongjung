package com.ssafy.usedtrade.domain.auth.handler;

import static com.ssafy.usedtrade.common.cookie.HttpCookieOAuth2AuthorizationRequestRepository.*;


import java.io.IOException;
import java.nio.charset.StandardCharsets;

import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import com.ssafy.usedtrade.common.cookie.CookieUtils;
import com.ssafy.usedtrade.common.cookie.HttpCookieOAuth2AuthorizationRequestRepository;
import com.ssafy.usedtrade.common.jwt.JwtTokenProvider;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class CustomOAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

	private final JwtTokenProvider tokenProvider;
	private final HttpCookieOAuth2AuthorizationRequestRepository httpCookieOAuth2AuthorizationRequestRepository;

	@Override
	public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
		Authentication authentication) throws IOException {

		String targetUrl = this.determineTargetUrl(request, response, authentication);

		if (response.isCommitted()) {
			return;
		}

		this.clearAuthenticationAttributes(request);
		this.httpCookieOAuth2AuthorizationRequestRepository.clearCookies(request, response);
		this.getRedirectStrategy().sendRedirect(request, response, targetUrl);
	}

	@Override
	protected String determineTargetUrl(HttpServletRequest request, HttpServletResponse response,
		Authentication authentication) {

		String targetUrl = CookieUtils
			.resolveCookie(request, REDIRECT_URL_PARAM_COOKIE_NAME)
			.map(Cookie::getValue)
			.orElse("/");

		return UriComponentsBuilder
			.fromUriString(targetUrl)
			.queryParam("access_token", tokenProvider.createAccessToken(authentication))
			.queryParam("refresh_token", tokenProvider.createRefreshToken(authentication))
			.queryParam("expires_in", tokenProvider.getExpiration())
			.encode(StandardCharsets.UTF_8)
			.build().toUriString();
	}
}


