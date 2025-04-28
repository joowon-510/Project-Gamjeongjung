package com.ssafy.usedtrade.domain.item.controller;

import com.ssafy.usedtrade.common.controller.BaseController;
import com.ssafy.usedtrade.common.response.Api;
import com.ssafy.usedtrade.domain.auth.entity.SecurityMemberDetails;
import com.ssafy.usedtrade.domain.item.dto.ItemDto;
import com.ssafy.usedtrade.domain.item.dto.ItemListDto;
import com.ssafy.usedtrade.domain.item.dto.ItemStatusDto;
import com.ssafy.usedtrade.domain.item.service.ItemService;
import com.ssafy.usedtrade.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/items")
@RequiredArgsConstructor
public class ItemController extends BaseController {

    private final ItemService itemService;
    private final UserService userService;

    //물품 등록
    @PostMapping("/regist-item")
    public Api<Void> registItem(@RequestBody ItemDto item,@AuthenticationPrincipal SecurityMemberDetails memberDetails) {
        item.setUserId(getUserId(memberDetails));
        itemService.registItem(item);
        return Api.OK();
    }
    //물품 정보 수정
    @PostMapping("/edit-item")
    public Api<Void> editItem(@RequestBody ItemDto item, @AuthenticationPrincipal SecurityMemberDetails memberDetails) {
        item.setUserId(getUserId(memberDetails));
        itemService.editItem(item);
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
    @GetMapping("/search-item")
    public Api<List<ItemListDto>> searchItem(@RequestParam  String itemName) {
        System.out.println(itemName);
        List<ItemListDto> itemList= itemService.searchItem(itemName);
        log.info("search-item result:{}",itemList);
        return Api.OK(itemList);
    }

    //상품 상세 조회
    @GetMapping("/item-info")
    public Api<Map<String, Object>> getItemInfo(@RequestParam Integer itemId,@AuthenticationPrincipal SecurityMemberDetails memberDetails) {
        ItemDto item = itemService.getItemInfo(itemId);
        String userName = userService.getUserNameById(item.getUserId());
        boolean isFavorite = itemService.isFavorite(itemId,getUserId(memberDetails));
        Map<String, Object> response = new HashMap<>();
        response.put("item", item);
        response.put("userName", userName);
        response.put("isFavorite", isFavorite);

        return Api.OK(response);
    }
    //찜한 목록 조회
    @GetMapping("/wishlist")
    public Api<List<ItemListDto>> getWishList(@AuthenticationPrincipal SecurityMemberDetails memberDetails) {
        List<ItemListDto> wishList= itemService.getWishList(getUserId(memberDetails));
        log.info("wish-list result:{}",wishList);
        return Api.OK(wishList);
    }

    //유저가 판매하는 상품 목록 조회
    @GetMapping("/item-list")
    public Api<List<ItemListDto>> getSalesItemList(@AuthenticationPrincipal SecurityMemberDetails memberDetails) {
        List<ItemListDto> itemList = itemService.getSalesItemList(getUserId(memberDetails));
        log.info("sales-item-list result:{}",itemList);
        return Api.OK(itemList);
    }

    //찜하기
    @PostMapping("/save-item/{itemId}")
    public Api<Void> saveItem(@PathVariable  Integer itemId,@AuthenticationPrincipal SecurityMemberDetails memberDetails ) {
        itemService.saveItem(itemId,getUserId(memberDetails));
        return Api.OK();
    }
}
