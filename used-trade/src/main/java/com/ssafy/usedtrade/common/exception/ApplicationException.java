package com.ssafy.usedtrade.common.exception;


import com.ssafy.usedtrade.common.error.ErrorCodeInterface;

public class ApplicationException extends RuntimeException {

    private final ErrorCodeInterface errorCode;

    public ApplicationException(ErrorCodeInterface errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public ErrorCodeInterface getErrorCode() {
        return errorCode;
    }

    public int getHttpStatusCode() {
        return errorCode.getHttpStatusCode();
    }

    public int getErrorCodeValue() {
        return errorCode.getStausCode();
    }
}

