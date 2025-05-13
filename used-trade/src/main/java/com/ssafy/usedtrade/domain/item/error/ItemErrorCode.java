package com.ssafy.usedtrade.domain.item.error;

import com.ssafy.usedtrade.common.error.ErrorCodeInterface;

public enum ItemErrorCode implements ErrorCodeInterface {

    ITEM_NOT_FOUND(500, 400, "물품 ID가 존재하지 않습니다."),
    USER_NOT_FOUND(500, 400, "존재하지 않는 유저입니다.");
    private final Integer httpStatusCode;
    private final Integer statusCode;
    private final String message;

    ItemErrorCode(Integer httpStatusCode, Integer statusCode, String message) {
        this.httpStatusCode = httpStatusCode;
        this.statusCode = statusCode;
        this.message = message;
    }

    @Override
    public Integer getHttpStatusCode() {
        return this.httpStatusCode;
    }

    @Override
    public Integer getStatusCode() {
        return this.statusCode;
    }

    @Override
    public String getMessage() {
        return this.message;
    }
}
