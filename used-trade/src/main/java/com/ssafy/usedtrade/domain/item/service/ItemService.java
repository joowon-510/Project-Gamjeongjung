package com.ssafy.usedtrade.domain.item.service;


import com.ssafy.usedtrade.domain.item.converter.ItemConverter;
import com.ssafy.usedtrade.domain.item.dto.ItemDto;
import com.ssafy.usedtrade.domain.item.dto.ItemListDto;
import com.ssafy.usedtrade.domain.item.entity.SalesItem;
import com.ssafy.usedtrade.domain.item.repository.ItemSalesRepository;
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
        System.out.println("searchItemmmmmmmmmm:"+itemName);
        List<ItemListDto> result = itemSalesRepository.findItemListDtoByTitle(itemName);
        System.out.println(result);
        return result;
        //        return itemSalesRepository.findItemListDtoByTitle(itemName);
    }

    public List<ItemListDto> getWishList(Integer userId) {
        return itemSalesRepository.findWishListByUserId(userId);
    }

    //찜 목록 가져오기


}
