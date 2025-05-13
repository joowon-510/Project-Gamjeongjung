package com.ssafy.usedtrade.domain.item.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
public class EsItemDto {
    private Integer id;
    private String title;
    private String description;
    private Integer price;
    private Boolean status;
    private String createdAt;
}
