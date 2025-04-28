package com.ssafy.usedtrade.domain.item.repository;

import com.ssafy.usedtrade.domain.item.dto.ItemListDto;
import com.ssafy.usedtrade.domain.item.entity.SalesItem;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemSalesRepository extends JpaRepository<SalesItem, Integer> {

    @Modifying
    @Transactional
    @Query("UPDATE SalesItem s SET s.status = :status WHERE s.id = :itemId")
    void changeItemStatusById(@Param("itemId") Integer itemId, @Param("status") Boolean status);

    List<ItemListDto> findByTitle(@Size(max = 255) @NotNull String title);

    @Query("SELECT new com.ssafy.usedtrade.domain.item.dto.ItemListDto(i.id, i.title, i.price, i.createdAt,i.status) FROM SalesItem i WHERE i.title LIKE %:title%")
    List<ItemListDto> findItemListDtoByTitle(@Param("title") String title);

    @Query("SELECT new com.ssafy.usedtrade.domain.item.dto.ItemListDto(s.id, s.title, s.price, s.createdAt,s.status) " +
            "FROM SalesItem s JOIN SaveItem si ON s.id = si.itemId " +
            "WHERE si.userId = :userId")
    List<ItemListDto> findWishListByUserId(@Param("userId") Integer userId);

    @Query("SELECT new com.ssafy.usedtrade.domain.item.dto.ItemListDto(si.id, si.title, si.price, si.createdAt,si.status) " +
            "FROM SalesItem si " +
            "WHERE si.userId = :userId")
    List<ItemListDto> findSalesItemByUserId(@Param("userId") Integer userId);


}
