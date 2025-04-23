package com.ssafy.usedtrade.common.exception;

import com.ssafy.usedtrade.common.error.ErrorCode;
import com.ssafy.usedtrade.common.response.Api;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.Order;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
@Order(value = Integer.MAX_VALUE)
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(value = ApplicationException.class)
    public ResponseEntity<Api<String>> handleApplicationException(ApplicationException exception) {
        log.error("ApplicationException occurred: {} - {}",
                exception.getErrorCode().getStatusCode(), exception.getMessage());

        return ResponseEntity
                .status(exception.getHttpStatusCode())
                .body(Api.ERROR(exception.getHttpStatusCode(), exception.getMessage()));
    }

    @ExceptionHandler(value = Exception.class)
    public ResponseEntity<Api<String>> handleGeneralException(Exception exception) {
        log.error("GeneralException error occurred: {}", exception.getMessage(), exception);

        return ResponseEntity
                .status(ErrorCode.SERVER_ERROR.getHttpStatusCode())
                .body(Api.ERROR(
                        ErrorCode.SERVER_ERROR.getHttpStatusCode(),
                        ErrorCode.SERVER_ERROR.getMessage()
                ));
    }
}
