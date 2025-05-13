package com.ssafy.usedtrade.domain.item.converter;

import com.ssafy.usedtrade.domain.item.dto.EsItemDto;
import com.ssafy.usedtrade.domain.item.dto.ItemDto;
import com.ssafy.usedtrade.domain.item.entity.ItemImage;
import com.ssafy.usedtrade.domain.item.entity.SalesItem;

public class ItemConverter {

    public static SalesItem dtoToEntity(ItemDto item) {
        SalesItem salesItem = new SalesItem();
        salesItem.setId(item.getItemId());
        salesItem.setUserId(item.getUserId());
        salesItem.setTitle(item.getTitle());
        salesItem.setDescription(item.getDescription());
        salesItem.setPrice(item.getPrice());
        salesItem.setPurchaseDate(item.getPurchaseDate());
        salesItem.setGrades(item.getGrades());
        salesItem.setStatus(item.getStatus());
        salesItem.setConfiguration(item.getConfiguration());
        salesItem.setCreatedAt(item.getCreatedAt());
        salesItem.setScratchesStatus(item.getScratchesStatus());
        salesItem.setSerialNumber(item.getSerialNumber());
        return salesItem;
    }

    public static ItemDto entityToDto(SalesItem salesItem) {
        ItemDto itemDto = new ItemDto();
        itemDto.setItemId(salesItem.getId());
        itemDto.setUserId(salesItem.getUserId());
        itemDto.setTitle(salesItem.getTitle());
        itemDto.setDescription(salesItem.getDescription());
        itemDto.setPrice(salesItem.getPrice());
        itemDto.setPurchaseDate(salesItem.getPurchaseDate());
        itemDto.setGrades(salesItem.getGrades());
        itemDto.setStatus(salesItem.getStatus());
        itemDto.setConfiguration(salesItem.getConfiguration());
        itemDto.setCreatedAt(salesItem.getCreatedAt());
        itemDto.setScratchesStatus(salesItem.getScratchesStatus());
        itemDto.setSerialNumber(salesItem.getSerialNumber());
        itemDto.setDeviceImageList(
                salesItem.getItemImageList().stream()
                        .map(ItemImage::getImageName)
                        .toList());
        return itemDto;
    }

    public static EsItemDto EsDtoToEsItem(SalesItem item) {
        return EsItemDto.builder()
                .id(item.getId())
                .title(item.getTitle())
                .description(item.getDescription())
                .price(item.getPrice())
                .status(item.getStatus())
                .createdAt(String.valueOf(item.getCreatedAt()))
                .build();
    }
}