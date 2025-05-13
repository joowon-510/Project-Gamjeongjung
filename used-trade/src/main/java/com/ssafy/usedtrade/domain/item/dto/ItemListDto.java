package com.ssafy.usedtrade.domain.item.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class ItemListDto {
    private Integer itemId;
    private String itemName;
    private int itemPrice;
    private LocalDateTime createdAt;
    private Boolean itemStatus;
    private String deviceImageUrl;
}
