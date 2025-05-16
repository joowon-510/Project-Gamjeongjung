package com.ssafy.usedtrade.domain.item.controller;

import com.ssafy.usedtrade.common.controller.BaseController;
import com.ssafy.usedtrade.common.response.Api;
import com.ssafy.usedtrade.common.service.AwsFileService;
import com.ssafy.usedtrade.domain.auth.entity.SecurityMemberDetails;
import com.ssafy.usedtrade.domain.item.dto.ImageUploadRequest;
import com.ssafy.usedtrade.domain.item.dto.ItemDto;
import com.ssafy.usedtrade.domain.item.dto.ItemListDto;
import com.ssafy.usedtrade.domain.item.dto.ItemStatusDto;
import com.ssafy.usedtrade.domain.item.dto.RegistResponse;
import com.ssafy.usedtrade.domain.item.service.ItemService;
import com.ssafy.usedtrade.domain.user.service.UserService;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/items")
@RequiredArgsConstructor
public class ItemController extends BaseController {

    private final ItemService itemService;
    private final UserService userService;
    private final AwsFileService awsFileService;

    //물품 등록
    @PostMapping("/regist-item")
    public Api<RegistResponse> registItem(
            @RequestBody ItemDto item,
            @AuthenticationPrincipal SecurityMemberDetails memberDetails) {
        return Api.OK(itemService.registItem(item, memberDetails.getId()));
    }

    // 이미지 업로드
    @PostMapping("/upload")
    public Api<Boolean> deviceImageUpload(
            @RequestPart("images") List<MultipartFile> file,
            @RequestPart("imageUploadRequest") ImageUploadRequest imageUploadRequest,
            @AuthenticationPrincipal SecurityMemberDetails memberDetails
    ) throws IOException {
        return Api.OK(awsFileService.savePhoto(file, imageUploadRequest, memberDetails.getId()));
    }

    //물품 정보 수정
    @PostMapping("/edit-item")
    public Api<Void> editItem(
            @RequestBody ItemDto item,
            @AuthenticationPrincipal SecurityMemberDetails memberDetails) {
        itemService.editItem(item, memberDetails.getId());
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
    public Api<Void> changeItemStatus(@PathVariable Integer itemId, @RequestBody ItemStatusDto statusDto) {
        itemService.changeItemStatus(itemId, statusDto.getStatus());
        return Api.OK();
    }

    //최신 상품 가져오기
    @GetMapping("/search-newItem")
    public Api<List<ItemListDto>> searchNewItem() {
        List<ItemListDto> itemList = itemService.searchNewItem();
        log.info("search-item result:{}", itemList);
        return Api.OK(itemList);
    }

    //상품 검색
    @GetMapping("/search-item")
    public Api<List<ItemListDto>> searchItem(@RequestParam String itemName) {
        List<ItemListDto> itemList = itemService.searchItem(itemName);
        log.info("search-item result:{}", itemList);
        return Api.OK(itemList);
    }

    //상품 상세 조회
    @GetMapping("/item-info")
    public Api<Map<String, Object>> getItemInfo(@RequestParam Integer itemId,
                                                @AuthenticationPrincipal SecurityMemberDetails memberDetails) {
        ItemDto item = itemService.getItemInfo(itemId);
        Map<String, Object> response = new HashMap<>();
        response.put("item", item);
        response.put("userName", userService.getUserNameById(item.getUserId()));
        response.put("isFavorite", itemService.isFavorite(itemId, getUserId(memberDetails)));

        return Api.OK(response);
    }

    //찜한 목록 조회
    @GetMapping("/wishlist")
    public Api<List<ItemListDto>> getWishList(@AuthenticationPrincipal SecurityMemberDetails memberDetails) {
        List<ItemListDto> wishList =
                itemService.getWishList(getUserId(memberDetails));
        log.info("wish-list result:{}", wishList);
        return Api.OK(wishList);
    }

    //유저가 판매하는 상품 목록 조회
    @PostMapping("/item-list")
    public Api<List<ItemListDto>> getSalesItemList(@RequestBody Integer userId){
        List<ItemListDto> itemList =
                itemService.getSalesItemList(userId);
        log.info("sales-item-list result:{}", itemList);
        return Api.OK(itemList);
    }

    //찜하기
    @PostMapping("/save-item/{itemId}")
    public Api<Void> saveItem(@PathVariable Integer itemId,
                              @AuthenticationPrincipal SecurityMemberDetails memberDetails) {
        itemService.saveItem(itemId, getUserId(memberDetails));
        return Api.OK();
    }
}
