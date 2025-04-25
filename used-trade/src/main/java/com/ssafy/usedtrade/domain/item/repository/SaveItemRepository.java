package com.ssafy.usedtrade.domain.item.repository;

import com.ssafy.usedtrade.domain.item.entity.SaveItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface SaveItemRepository extends JpaRepository<SaveItem, Integer> {

}
