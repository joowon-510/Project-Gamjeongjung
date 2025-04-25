package com.ssafy.usedtrade.domain.item.service;


import com.ssafy.usedtrade.domain.item.converter.ItemConverter;
import com.ssafy.usedtrade.domain.item.dto.EsItemDto;
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

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ItemService {

    private final ItemSalesRepository itemSalesRepository;
    private final SaveItemRepository saveItemRepository;
    private final ElasticSearchService elasticSearchService;

    //물품 등록
    @Transactional
    public void registItem(ItemDto item) {
        SalesItem salesItem = ItemConverter.dtoToEntity(item);
        itemSalesRepository.save(salesItem);

        EsItemDto esItem = ItemConverter.EsDtoToEsItem(salesItem);
        elasticSearchService.save(esItem);
    }

    public void deleteItem(Integer itemId) {
        if (itemSalesRepository.existsById(itemId)) {  // 먼저 해당 아이템이 존재하는지 확인
            itemSalesRepository.deleteById(itemId);  // 아이템 삭제
            elasticSearchService.delete(itemId);
        } else {
            throw new RuntimeException("Item not found");  // 예외 처리
        }
    }

    //상품 상태 변경
    public void changeItemStatus(Integer itemId, Boolean status) {
        itemSalesRepository.changeItemStatusById(itemId,status);
    }

    //상품 검색
    public List<ItemListDto> searchItem(String keyword) {
        List<ItemListDto> result = itemSalesRepository.findItemListDtoByTitle(keyword);
        System.out.println(result);
        List<EsItemDto> esResult = elasticSearchService.searchItem(keyword);
        System.out.println(esResult);

        return esResult.stream()
                .map(item -> ItemListDto.builder()
                        .itemId(item.getId())
                        .itemName(item.getTitle())
                        .itemPrice(item.getPrice())
                        .createdAt(LocalDateTime.parse(item.getCreatedAt()))         // 필요한 경우
                        .itemStatus(item.getStatus())           // 필요한 경우
                        .build())
                .collect(Collectors.toList());
    }
//        return itemSalesRepository.findItemListDtoByTitle(itemName);

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

    //아이템 수정
    @Transactional
    public void editItem(ItemDto itemDto) {
        System.out.println("service");
        SalesItem item = itemSalesRepository.findById(itemDto.getItemId())
                .orElseThrow(() -> new ItemException(ItemErrorCode.ITEM_NOT_FOUND));

        // grades, scratchesStatus는 수정하지 않음
        item.setTitle(itemDto.getTitle());
        item.setDescription(itemDto.getDescription());
        item.setPrice(itemDto.getPrice());
        item.setPurchaseDate(itemDto.getPurchaseDate());
        item.setStatus(itemDto.getStatus());
        item.setConfiguration(itemDto.getConfiguration());

        EsItemDto esItem = ItemConverter.EsDtoToEsItem(item);
        elasticSearchService.save(esItem);
    }

}
