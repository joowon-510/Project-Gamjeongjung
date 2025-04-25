package com.ssafy.usedtrade.domain.item.exception;


import com.ssafy.usedtrade.common.error.ErrorCodeInterface;
import com.ssafy.usedtrade.common.exception.ApplicationException;

public class ItemException extends ApplicationException {

    public ItemException(ErrorCodeInterface errorCode) {
        super(errorCode);
    }

}
