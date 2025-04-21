package com.ssafy.usedtrade.domain.item.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ItemDto {
    private Integer userId;
    private String title;
    private String description;
    private int price;
    private String purchaseDate;
    private Boolean grades;
    private Boolean status;
    private int configuration;
    private LocalDateTime createdAt;
    private String scratchesStatus;
}
