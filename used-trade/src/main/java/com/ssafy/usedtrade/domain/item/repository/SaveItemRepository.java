package com.ssafy.usedtrade.domain.item.repository;

import com.ssafy.usedtrade.domain.item.entity.SaveItem;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SaveItemRepository extends JpaRepository<SaveItem, Integer> {

    boolean existsByUserIdAndItemId(Integer userId, Integer itemId);

    // 기존 찜 목록에 있는지 확인 후, 없다면 insert, 있으면 delete
    default void handleWishItem(Integer itemId, Integer userId) {
        Optional<SaveItem> isSaveItem =
                findByUserIdAndItemId(userId, itemId);

        if (isSaveItem.isPresent()) {
            // 찜 목록에 이미 있으면 삭제
            delete(isSaveItem.get());
        } else {
            // 찜 목록에 없으면 추가
            SaveItem saveItem = new SaveItem();
            saveItem.setItemId(itemId);
            saveItem.setUserId(userId);
            save(saveItem);
        }
    }

    Optional<SaveItem> findByUserIdAndItemId(Integer userId, Integer itemId);


    void deleteByUserIdAndItemId(Integer userId, Integer itemId);
}
