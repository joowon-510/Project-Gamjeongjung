package com.ssafy.usedtrade.common.response;

public class Api<T> {
    private int status_code;
    private T body;

    private Api(int statusCode, T body) {
        this.status_code = statusCode;
        this.body = body;
    }

    public static <T> Api<T> OK(T body) {
        return new Api<>(200, body); // 성공 코드도 커스텀으로 관리 가능
    }

    public static Api<Void> OK() {
        return new Api<>(200, null);
    }

    public static <T> Api<T> ERROR(int statusCode, T message) {
        return new Api<>(statusCode, message);
    }

    public int getStatus_code() {
        return status_code;
    }

    public T getBody() {
        return body;
    }
}
