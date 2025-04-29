package com.ssafy.usedtrade.domain.item.service;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch.core.search.Hit;
import com.ssafy.usedtrade.domain.item.dto.EsItemDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ElasticSearchService {

    private final ElasticsearchClient elasticsearchClient;

    public void save(EsItemDto item) {
        try {
            elasticsearchClient.index(i -> i
                    .index("items")
                    .id(item.getId().toString())
                    .document(item)
            );
        } catch (Exception e) {
            throw new RuntimeException("failed to save item into elasticsearch: " + e.getMessage(), e);
        }
    }

    public void delete(Integer itemId) {
        try {
            elasticsearchClient.delete(d -> d
                    .index("items")
                    .id(itemId.toString())
                    );
        }catch (Exception e){
            throw new RuntimeException("failed to delete item into elasticsearch");
        }
    }

    public List<EsItemDto> searchItem(String keyword) {
        try {

            var resp = elasticsearchClient.search(s -> s
                            .index("items")
                            .query(q -> q
                                    .multiMatch(m -> m
                                            .fields("title", "description")
                                            .query(keyword)
                                            .fuzziness("AUTO") // 오타나 유사어 허용
                                    )
                            ),
                    EsItemDto.class
            );

            return resp.hits().hits().stream()
                    .map(hit -> hit.source())
                    .collect(Collectors.toList());

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("failed to search item into elasticsearch: " + e.getMessage(), e);
        }
    }

    public EsItemDto findById(Integer itemId) {
        try {
            var response = elasticsearchClient.get(g -> g
                            .index("items")
                            .id(itemId.toString()),
                    EsItemDto.class
            );

            if (response.found()) {
                return response.source();
            } else {
                return null;
            }
        } catch (Exception e) {
            throw new RuntimeException("failed to find item from elasticsearch: " + e.getMessage(), e);
        }
    }

}
