package com.ssafy.usedtrade.domain.item.repository;

import com.ssafy.usedtrade.domain.item.dto.ItemListDto;
import com.ssafy.usedtrade.domain.item.entity.SalesItem;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ItemSalesRepository extends JpaRepository<SalesItem, Integer> {

    @Modifying
    @Transactional
    @Query("UPDATE SalesItem s SET s.status = :status WHERE s.id = :itemId")
    void changeItemStatusById(@Param("itemId") Integer itemId, @Param("status") Boolean status);

    List<ItemListDto> findByTitle(@Size(max = 255) @NotNull String title);

    @Query("SELECT new com.ssafy.usedtrade.domain.item.dto.ItemListDto(i.id, i.title, i.price, i.createdAt,i.status, '') "
            + "FROM SalesItem i JOIN ItemImage image On image.salesItem = i "
            + "WHERE i.title "
            + "LIKE %:title%")
    List<ItemListDto> findItemListDtoByTitle(@Param("title") String title);

    @Query("SELECT new com.ssafy.usedtrade.domain.item.dto.ItemListDto(s.id, s.title, s.price, s.createdAt,s.status, "
            + "(SELECT i.imageName FROM ItemImage i WHERE i.salesItem = s ORDER BY i.id ASC LIMIT 1)) "
            + "FROM SalesItem s JOIN SaveItem si ON s.id = si.itemId "
            + "WHERE si.userId = :userId ")
    List<ItemListDto> findWishListByUserId(@Param("userId") Integer userId);

    @Query("SELECT new com.ssafy.usedtrade.domain.item.dto.ItemListDto(si.id, si.title, si.price, si.createdAt,si.status, "
            + "(SELECT i.imageName FROM ItemImage i WHERE i.salesItem = si ORDER BY i.id ASC LIMIT 1)) "
            + "FROM SalesItem si "
            + "WHERE si.userId = :userId")
    List<ItemListDto> findSalesItemByUserId(@Param("userId") Integer userId);
}
