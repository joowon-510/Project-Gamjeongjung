package com.ssafy.usedtrade.domain.item.service;


import com.ssafy.usedtrade.domain.item.converter.ItemConverter;
import com.ssafy.usedtrade.domain.item.dto.EsItemDto;
import com.ssafy.usedtrade.domain.item.dto.ItemDto;
import com.ssafy.usedtrade.domain.item.dto.ItemListDto;
import com.ssafy.usedtrade.domain.item.dto.RegistResponse;
import com.ssafy.usedtrade.domain.item.entity.SalesItem;
import com.ssafy.usedtrade.domain.item.entity.SaveItem;
import com.ssafy.usedtrade.domain.item.error.ItemErrorCode;
import com.ssafy.usedtrade.domain.item.exception.ItemException;
import com.ssafy.usedtrade.domain.item.repository.ItemSalesRepository;
import com.ssafy.usedtrade.domain.item.repository.SaveItemRepository;
import com.ssafy.usedtrade.domain.review.repository.ReviewRepository;
import com.ssafy.usedtrade.domain.user.entity.User;
import com.ssafy.usedtrade.domain.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class ItemService {

    private final ItemSalesRepository itemSalesRepository;
    private final SaveItemRepository saveItemRepository;
    private final ElasticSearchService elasticSearchService;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    //물품 등록
    @Transactional
    public RegistResponse registItem(ItemDto item, Integer memberId) {
        item.setUserId(memberId);

        SalesItem salesItem = itemSalesRepository.save(
                ItemConverter.dtoToEntity(item));

        elasticSearchService.save(
                ItemConverter.EsDtoToEsItem(salesItem));

        return RegistResponse.builder()
                .itemId(salesItem.getId())
                .build();
    }

    @Transactional
    public void deleteItem(Integer itemId) {
        if (itemSalesRepository.existsById(itemId)) {  // 먼저 해당 아이템이 존재하는지 확인
            SalesItem salesItem = itemSalesRepository.findById(itemId)
                    .orElseThrow(() -> new IllegalArgumentException("아이템이 존재하지 않습니다."));

            reviewRepository.deleteByItem(salesItem);
            itemSalesRepository.delete(salesItem);  // 아이템 삭제
            elasticSearchService.delete(itemId);
        } else {
            throw new RuntimeException("Item not found");  // 예외 처리
        }
    }

    //상품 상태 변경
    public void changeItemStatus(Integer itemId, Boolean status) {
        itemSalesRepository.changeItemStatusById(itemId, status);

        EsItemDto esItem = elasticSearchService.findById(itemId);
        if (esItem != null) {
            esItem.setStatus(status);
            elasticSearchService.save(esItem);
        }
    }

    //상품 검색
    public List<ItemListDto> searchItem(String keyword) {
        List<ItemListDto> result = itemSalesRepository.findItemListDtoByTitle(keyword);
        System.out.println(result);

        List<EsItemDto> esResult = elasticSearchService.searchItem(keyword);
        System.out.println(esResult);

        Map<Integer, String> urlMap = new HashMap<>();

        //TODO: 하드하게 대입 -> 무조건 삭제하기!
        next:
        for (EsItemDto esItemDto : esResult) {
            for (ItemListDto dto : result) {
                if (esItemDto.getId() == dto.getItemId()) {
                    urlMap.put(esItemDto.getId(), dto.getDeviceImageUrl());
                    continue next;
                }
            }
        }

        return esResult.stream()
                .map(item -> ItemListDto.builder()
                        .itemId(item.getId())
                        .itemName(item.getTitle())
                        .itemPrice(item.getPrice())
                        .createdAt(LocalDateTime.parse(item.getCreatedAt()))         // 필요한 경우
                        .itemStatus(item.getStatus())
                        .deviceImageUrl(urlMap.get(item.getId()))
                        .build())
                .collect(Collectors.toList());
    }
//        return itemSalesRepository.findItemListDtoByTitle(itemName);

    //찜한 목록 조회
    public List<ItemListDto> getWishList(Integer userId) {
        return itemSalesRepository.findWishListByUserId(userId);
    }

    // 상품 상세 조회
    public ItemDto getItemInfo(Integer itemId) {
        // 아이템 조회
        SalesItem item = itemSalesRepository.findById(itemId)
                .orElseThrow(() -> new ItemException(ItemErrorCode.ITEM_NOT_FOUND));

        // 아이템의 userId로 유저 조회
        User user = userRepository.findById(item.getUserId())
                .orElseThrow(() -> new ItemException(ItemErrorCode.USER_NOT_FOUND));

        // 유저의 상태가 0이 아닌 경우 예외 처리
        if (user.getStatus() != 0) {
            throw new ItemException(ItemErrorCode.USER_NOT_FOUND);  // 유저 비활성 예외
        }

        // 유저가 활성 상태일 경우, 아이템 정보 반환
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
    public void editItem(ItemDto itemDto, Integer memberId) {
        SalesItem item = itemSalesRepository.findById(itemDto.getItemId())
                .orElseThrow(() -> new ItemException(ItemErrorCode.ITEM_NOT_FOUND));

        // grades, scratchesStatus는 수정하지 않음
        item.setUserId(memberId);
        item.setTitle(itemDto.getTitle());
        item.setDescription(itemDto.getDescription());
        item.setPrice(itemDto.getPrice());
        item.setPurchaseDate(itemDto.getPurchaseDate());
        item.setStatus(itemDto.getStatus());
        item.setConfiguration(itemDto.getConfiguration());

        EsItemDto esItem = ItemConverter.EsDtoToEsItem(item);
        elasticSearchService.save(esItem);
    }

    public boolean isFavorite(Integer itemId, Integer userId) {
        return saveItemRepository.existsByUserIdAndItemId(itemId, userId);
    }
}
