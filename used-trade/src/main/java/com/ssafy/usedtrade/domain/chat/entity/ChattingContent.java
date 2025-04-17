package com.ssafy.usedtrade.domain.chat.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "chatting_contents")
public class ChattingContent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @NotNull
    @Column(name = "chating_list_id", nullable = false)
    private Integer chatingListId;

    @NotNull
    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Size(max = 255)
    @NotNull
    @Column(name = "contents", nullable = false)
    private String contents;

    @NotNull
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

}