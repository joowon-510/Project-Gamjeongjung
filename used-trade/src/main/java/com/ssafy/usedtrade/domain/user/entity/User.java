package com.ssafy.usedtrade.domain.user.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;

@Getter
@Entity
@Table(name = "user")
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Size(max = 255)
    @Column(name = "nickname", nullable = false)
    private String nickname;

    @Size(max = 255)
    @NotNull
    @Column(name = "email", nullable = false)
    private String email;

//    @Size(max = 255)
//    @NotNull
//    @Column(name = "phone_number", nullable = false)
//    private String phoneNumber;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "status", nullable = false)
    private Integer status;

    @Builder(access = AccessLevel.PRIVATE)
    public User(String email, String nickname, String phoneNumber, Integer status) {
        this.email = email;
        this.nickname = nickname;
        this.status = status;
    }

    private User(Integer id, String email, String nickname) {
        this.id = id;
        this.email = email;
        this.nickname = nickname;
    }

    public static User createUser(String email, String nickname) {
        return User.builder()
                .email(email)
                .nickname(nickname)
                .status(0)
                .build();
    }

    public static User createUser(Integer id, String email, String nickname) {
        return new User(id, email, nickname);
    }

    public void updateNickname(String nickname) {
        this.nickname = nickname;
    }

    public void updateStatus(int status) {
        this.status = status;
    }

}