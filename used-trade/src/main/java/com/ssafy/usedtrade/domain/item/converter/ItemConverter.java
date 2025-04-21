package com.ssafy.usedtrade.domain.item.converter;

import com.ssafy.usedtrade.domain.item.dto.ItemDto;
import com.ssafy.usedtrade.domain.item.entity.SalesItem;

public class ItemConverter {

    public static SalesItem dtoToEntity(ItemDto item) {
        SalesItem salesItem = new SalesItem();
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
        return salesItem;
    }
}