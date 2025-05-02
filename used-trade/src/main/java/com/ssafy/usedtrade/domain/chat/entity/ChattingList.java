package com.ssafy.usedtrade.domain.chat.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "chatting_list")
public class ChattingList {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @OneToMany(mappedBy = "chattingList", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<ChattingContent> chattingContentList;

    @NotNull
    @Column(name = "seller_id", nullable = false)
    private Integer sellerId;

    @NotNull
    @Column(name = "buyer_id", nullable = false)
    private Integer buyerId;

    @NotNull
    @Column(name = "post_id", nullable = false)
    private Integer postId;

    @NotNull
    @Column(name = "last_chat_time", nullable = false)
    private LocalDateTime lastChatTime;
}