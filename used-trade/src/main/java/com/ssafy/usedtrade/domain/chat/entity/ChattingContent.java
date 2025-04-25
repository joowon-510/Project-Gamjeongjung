package com.ssafy.usedtrade.domain.chat.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "chatting_contents")
public class ChattingContent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne
    private ChattingList chattingList;

    @NotNull
    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Lob
    @NotNull
    @Column(name = "contents", nullable = false)
    private String contents;

    @NotNull
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}