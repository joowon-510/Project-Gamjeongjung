package com.ssafy.usedtrade.common.error;

public interface ErrorCodeInterface {

    Integer getHttpStatusCode();

    Integer getStausCode();

    String getMessage();

}