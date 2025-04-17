package com.ssafy.usedtrade.domain.item.controller;

import com.ssafy.usedtrade.common.response.Api;
import com.ssafy.usedtrade.domain.item.service.ItemService;
import lombok.RequiredArgsConstructor;
import org.hibernate.cache.spi.support.AbstractReadWriteAccess;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;

//    @PostMapping("/regist-item")
//    public Api<Void> registItem(@RequestBody ItemDto item) {
//        return Api<O>
//    }

}
