package com.ssafy.usedtrade.domain.item.dto;

import lombok.*;
import org.springframework.data.elasticsearch.annotations.Document;

import java.time.LocalDateTime;

@Document(indexName = "items") // ES에서 사용할 인덱스 이름
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EsItemDocument {
    private Integer id;
    private String title;
    private String description;
    private Integer price;
    private Boolean status;
    private LocalDateTime createdAt;

}
