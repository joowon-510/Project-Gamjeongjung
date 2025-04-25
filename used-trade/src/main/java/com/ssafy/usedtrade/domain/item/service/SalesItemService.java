package com.ssafy.usedtrade.domain.item.service;

import com.ssafy.usedtrade.domain.item.entity.SalesItem;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SalesItemService {
    public SalesItem testGetItem() {
        SalesItem salesItem = new SalesItem();
        salesItem.setUserId(2);

        return salesItem;
    }
}
