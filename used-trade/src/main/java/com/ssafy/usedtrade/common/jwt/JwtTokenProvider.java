package com.ssafy.usedtrade.common.jwt;

import java.security.Key;
import java.security.SignatureException;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import com.ssafy.usedtrade.domain.auth.entity.SecurityMemberDetails;
import com.ssafy.usedtrade.domain.user.entity.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtTokenProvider implements InitializingBean {

	@Value("${jwt.secret}")
	private String secretKey;

	@Value("${jwt.access_expiration}")
	private long accessTokenExpiration;

	@Value("${jwt.refresh_expiration}")
	private long refreshTokenExpiration;

	private Key SECRET_KEY;

	private final RefreshTokenService refreshTokenService;

	@Override
	public void afterPropertiesSet() throws Exception {
		byte[] keyBytes = Decoders.BASE64.decode(secretKey);
		this.SECRET_KEY = Keys.hmacShaKeyFor(keyBytes);
	}

	@SuppressWarnings("deprecation")
	public boolean validate(String token) {
		try {
			Jwts.parser().verifyWith((SecretKey) SECRET_KEY).build().parseSignedClaims(token);
			return true;
		}
		// catch (SignatureException e) {
		// 	throw new IllegalArgumentException("유효하지 않은 JWT 서명입니다.");
		// }
		catch (MalformedJwtException e) {
			throw new IllegalArgumentException("유효하지 않은 JWT 토큰입니다.");
		}
		catch (ExpiredJwtException e) {
			throw new IllegalArgumentException("만료된 JWT 토큰입니다.");
		}
		catch (UnsupportedJwtException e) {
			throw new IllegalArgumentException("지원되지 않는 JWT 토큰입니다.");
		}
		catch (IllegalArgumentException e) {
			throw new IllegalArgumentException("JWT 토큰이 비어있습니다.");
		}
	}

	public UsernamePasswordAuthenticationToken decode(String token) {
		Claims claims = this.parseClaims(token);
		String memberId = claims.getSubject();
		String email = claims.get("email", String.class);
		String name = claims.get("name", String.class);

		SecurityMemberDetails principal = new SecurityMemberDetails(
			User.createUser(Integer.parseInt(memberId), email, name)
		);

		return new UsernamePasswordAuthenticationToken(principal, null, null);
	}

	public String createAccessToken(Authentication authentication) {
		return createToken(authentication, accessTokenExpiration);
	}

	public String createRefreshToken(Authentication authentication) {
		String token = this.createToken(authentication, refreshTokenExpiration);

		refreshTokenService.saveRefreshToken(token, refreshTokenExpiration);
		return token;
	}

	public TokenDto reissueAccessTokenUsing(String refreshToken) {
		try {
			Claims claims = this.parseClaims(refreshToken);
			return this.createAccessTokenOnly(claims);
		} catch (JwtException e) {
			throw new IllegalArgumentException("리프레쉬 토큰이 만료되었습니다.");
		}
	}

	public TokenDto reissueTokensUsing(String refreshToken) throws JwtException {
		try {
			Claims claims = this.parseClaims(refreshToken);
			return this.createTokens(claims);
		} catch (JwtException e) {
			throw new IllegalArgumentException("리프레쉬 토큰이 만료되었습니다.");
		}
	}

	public Long getExpiration() {
		return this.accessTokenExpiration / 1000;
	}

	private String createToken(Authentication authentication, Long expiration) {
		assert authentication != null;

		SecurityMemberDetails principal = (SecurityMemberDetails) authentication.getPrincipal();
		User user = principal.user();

		Date now = new Date();
		Date expiryDate = new Date(now.getTime() + expiration);

		return Jwts.builder()
			.subject(String.valueOf(user.getId()))
			.claim("email", user.getEmail())
			.claim("name", user.getNickname())
			.issuedAt(now)
			.expiration(expiryDate)
			.signWith(SECRET_KEY)
			.compact();
	}

	private TokenDto createAccessTokenOnly(Claims claims) {
		Date now = new Date();

		String accessToken = Jwts.builder()
			.claims(claims)
			.issuedAt(now)
			.expiration(
				new Date(now.getTime() + accessTokenExpiration))
			.signWith(SECRET_KEY)
			.compact();

		return TokenDto.builder()
			.grantType("Bearer")
			.accessToken(accessToken)
			.refreshToken("")
			.expiresIn(getExpiration())
			.build();
	}

	private TokenDto createTokens(Claims claims) {
		Date now = new Date();

		String accessToken = Jwts.builder()
			.claims(claims)
			.issuedAt(now)
			.expiration(
				new Date(now.getTime() + accessTokenExpiration))
			.signWith(SECRET_KEY)
			.compact();

		String refreshToken = Jwts.builder()
			.claims(claims)
			.issuedAt(now)
			.expiration(
				new Date(now.getTime() + refreshTokenExpiration))
			.signWith(SECRET_KEY)
			.compact();

		refreshTokenService.saveRefreshToken(refreshToken, refreshTokenExpiration);

		return TokenDto.builder()
			.grantType("Bearer")
			.accessToken(accessToken)
			.refreshToken(refreshToken)
			.expiresIn(getExpiration())
			.build();
	}

	private Claims parseClaims(String token) throws JwtException {
		return Jwts.parser()
			.verifyWith((SecretKey) SECRET_KEY)
			.build()
			.parseSignedClaims(token)
			.getPayload();
	}
}


