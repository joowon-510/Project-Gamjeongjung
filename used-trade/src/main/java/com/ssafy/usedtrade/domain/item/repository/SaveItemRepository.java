package com.ssafy.usedtrade.domain.item.repository;

import com.ssafy.usedtrade.domain.item.entity.SaveItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SaveItemRepository extends JpaRepository<SaveItem, Integer> {

    boolean existsByUserIdAndItemId(Integer userId, Integer itemId);

    // 기존 찜 목록에 있는지 확인 후, 없다면 insert, 있으면 delete
    default void handleWishItem(Integer itemId, Integer userId) {
        if (existsByUserIdAndItemId(userId, itemId)) {
            // 찜 목록에 이미 있으면 삭제
            deleteByUserIdAndItemId(userId, itemId);
        } else {
            // 찜 목록에 없으면 추가
            SaveItem saveItem = new SaveItem();
            saveItem.setItemId(itemId);
            saveItem.setUserId(userId);
            save(saveItem);
        }
    }
    void deleteByUserIdAndItemId(Integer userId, Integer itemId);
}
