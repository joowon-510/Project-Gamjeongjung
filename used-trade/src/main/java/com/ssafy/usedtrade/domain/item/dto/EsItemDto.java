package com.ssafy.usedtrade.domain.item.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDateTime;

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
