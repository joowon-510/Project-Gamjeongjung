package com.ssafy.usedtrade.domain.chat.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
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
@Table(name = "read_point")
public class ReadPoint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    String roomId;

    String userId;

    LocalDateTime createdAt;
}
