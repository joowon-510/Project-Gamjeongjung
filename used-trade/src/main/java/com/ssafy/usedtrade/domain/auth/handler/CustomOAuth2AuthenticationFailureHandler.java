package com.ssafy.usedtrade.domain.auth.handler;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerExceptionResolver;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class CustomOAuth2AuthenticationFailureHandler implements AuthenticationFailureHandler {

	private final HandlerExceptionResolver resolver;

	public CustomOAuth2AuthenticationFailureHandler(
		@Qualifier("handlerExceptionResolver") HandlerExceptionResolver resolver
	) {
		this.resolver = resolver;
	}

	@Override
	public void onAuthenticationFailure(
		HttpServletRequest request,
		HttpServletResponse response,
		AuthenticationException exception
	) throws IOException, ServletException {
		//-- 로그인이 실패했을 때 작동되는 로직 입력 --//
		resolver.resolveException(request, response, null, exception);
	}
}

