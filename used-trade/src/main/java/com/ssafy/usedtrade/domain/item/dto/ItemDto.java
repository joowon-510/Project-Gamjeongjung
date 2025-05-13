package com.ssafy.usedtrade.domain.item.dto;

import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemDto {
    private Integer userId;
    private Integer itemId;
    private String title;
    private String description;
    private int price;
    private String purchaseDate;
    private Boolean grades;
    private Boolean status;
    private int configuration;
    private LocalDateTime createdAt;
    private String scratchesStatus;
    private String serialNumber;
    private List<String> deviceImageList;
}
