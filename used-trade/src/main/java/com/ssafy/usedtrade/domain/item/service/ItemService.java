package com.ssafy.usedtrade.domain.item.service;


import com.ssafy.usedtrade.domain.item.converter.ItemConverter;
import com.ssafy.usedtrade.domain.item.dto.ItemDto;
import com.ssafy.usedtrade.domain.item.dto.ItemListDto;
import com.ssafy.usedtrade.domain.item.entity.SalesItem;
import com.ssafy.usedtrade.domain.item.entity.SaveItem;
import com.ssafy.usedtrade.domain.item.error.ItemErrorCode;
import com.ssafy.usedtrade.domain.item.exception.ItemException;
import com.ssafy.usedtrade.domain.item.repository.ItemSalesRepository;
import com.ssafy.usedtrade.domain.item.repository.SaveItemRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ItemService {

    private final ItemSalesRepository itemSalesRepository;
    private final SaveItemRepository saveItemRepository;

    //item 등록
    @Transactional
    public void registItem(ItemDto item) {
        SalesItem salesItem = ItemConverter.dtoToEntity(item);
        itemSalesRepository.save(salesItem);
    }

    public void deleteItem(Integer itemId) {
        if (itemSalesRepository.existsById(itemId)) {  // 먼저 해당 아이템이 존재하는지 확인
            itemSalesRepository.deleteById(itemId);  // 아이템 삭제
        } else {
            throw new RuntimeException("Item not found");  // 예외 처리
        }
    }

    //상품 상태 변경
    public void changeItemStatus(Integer itemId, Boolean status) {
        itemSalesRepository.changeItemStatusById(itemId,status);
    }

    //상품 검색
    public List<ItemListDto> searchItem(String itemName) {
        List<ItemListDto> result = itemSalesRepository.findItemListDtoByTitle(itemName);
        return result;
        //        return itemSalesRepository.findItemListDtoByTitle(itemName);
    }

    //찜한 목록 조회
    public List<ItemListDto> getWishList(Integer userId) {
        return itemSalesRepository.findWishListByUserId(userId);
    }

    //상품 상세 조회
    public ItemDto getItemInfo(Integer itemId) {
        SalesItem item = itemSalesRepository.findById(itemId)
                .orElseThrow(() -> new ItemException(ItemErrorCode.ITEM_NOT_FOUND));

        return ItemConverter.entityToDto(item);

    }

    //판매 목록 가져오기
    public List<ItemListDto> getSalesItemList(Integer userId) {
        return itemSalesRepository.findSalesItemByUserId(userId);
    }

    //아이템 찜하기
    public void saveItem(Integer itemId, Integer userId) {
        SaveItem saveItem = new SaveItem();
        saveItem.setItemId(itemId);
        saveItem.setUserId(userId);
        saveItemRepository.save(saveItem);
    }

}
