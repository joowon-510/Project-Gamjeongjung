package com.ssafy.usedtrade.domain.item.repository;

import com.ssafy.usedtrade.domain.item.entity.SaveItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


@Repository
public interface SaveItemRepository extends JpaRepository<SaveItem, Integer> {


    boolean existsByUserIdAndItemId(Integer userId, Integer itemId);

}
