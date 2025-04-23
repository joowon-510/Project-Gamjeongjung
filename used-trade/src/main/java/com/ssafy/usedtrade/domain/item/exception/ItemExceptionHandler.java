package com.ssafy.usedtrade.domain.item.exception;

import com.ssafy.usedtrade.common.error.ErrorCodeInterface;
import com.ssafy.usedtrade.common.response.Api;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.Order;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
@Order(2)
public class ItemExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(ItemExceptionHandler.class);

    @ExceptionHandler(ItemException.class)
    public ResponseEntity<Api<String>> handleUserException(ItemException exception) {
        ErrorCodeInterface errorCode = exception.getErrorCode();

        log.error("ItemException occurred: {} - {}", errorCode.getStatusCode(), errorCode.getMessage(), exception);

        return ResponseEntity
                .status(errorCode.getHttpStatusCode())
                .body(Api.ERROR(errorCode.getStatusCode(), errorCode.getMessage()));
    }
}
