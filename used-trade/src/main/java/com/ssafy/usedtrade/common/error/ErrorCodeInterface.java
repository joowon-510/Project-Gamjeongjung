package com.ssafy.usedtrade.common.error;

public interface ErrorCodeInterface {

    Integer getHttpStatusCode();

    Integer getStatusCode();

    String getMessage();

}