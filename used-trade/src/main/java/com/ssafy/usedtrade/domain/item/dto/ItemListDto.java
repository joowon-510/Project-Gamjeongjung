package com.ssafy.usedtrade.domain.item.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ItemListDto {
    private Integer itemId;
    private  String itemName;
    private  int itemPrice;
    private LocalDateTime createdAt;
}
