package com.ssafy.usedtrade.domain.item.repository;

import com.ssafy.usedtrade.domain.item.entity.SaveItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


@Repository
public interface SaveItemRepository extends JpaRepository<SaveItem, Integer> {


    @Query("SELECT CASE WHEN COUNT(w) > 0 THEN true ELSE false END FROM SaveItem w WHERE w.userId = :userId AND w.itemId = :itemId")
    boolean existsInWishList(@Param("userId") Integer userId, @Param("itemId") Integer itemId);

}
