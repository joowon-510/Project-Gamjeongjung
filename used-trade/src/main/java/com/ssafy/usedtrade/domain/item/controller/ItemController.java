package com.ssafy.usedtrade.domain.item.controller;

import com.ssafy.usedtrade.common.response.Api;
import com.ssafy.usedtrade.domain.item.dto.ItemDto;
import com.ssafy.usedtrade.domain.item.dto.ItemListDto;
import com.ssafy.usedtrade.domain.item.dto.ItemStatusDto;
import com.ssafy.usedtrade.domain.item.service.ItemService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;

    //물품 등록
    @PostMapping("/regist-item")
    public Api<Void> registItem(@RequestBody ItemDto item) {
        itemService.registItem(item);
        return Api.OK();
    }

    //물품 삭제
    @DeleteMapping("/delete-item")
    public Api<Void> deleteItem(@RequestParam Integer itemId) {
        itemService.deleteItem(itemId);
        return Api.OK();
    }

    //물품 상태 변경
    @PatchMapping("/{itemId}/status")
    public Api<Void> changeItemStatus(@PathVariable Integer itemId, @RequestBody ItemStatusDto statusDto){
        itemService.changeItemStatus(itemId, statusDto.getStatus());
        return Api.OK();
    }

    //상품 검색
    @GetMapping("/search-item/{itemName}")
    public Api<List<ItemListDto>> searchItem(@PathVariable String itemName) {
        List<ItemListDto> itemList= itemService.searchItem(itemName);
        log.info("search-item result:{}",itemList);
        return Api.OK(itemList);
    }

    //찜한 목록 조회
    @GetMapping("/{userId}/wishlist")
    public Api<List<ItemListDto>> getWishList(@PathVariable Integer userId) {
        List<ItemListDto> wishList= itemService.getWishList(userId);
        log.info("wish-list result:{}",wishList);
        return Api.OK(wishList);
    }
}
