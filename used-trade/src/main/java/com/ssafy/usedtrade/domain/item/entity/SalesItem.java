package com.ssafy.usedtrade.domain.item.entity;

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
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "sales_item")
public class SalesItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @OneToMany(mappedBy = "salesItem", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<ItemImage> itemImageList;

    @NotNull
    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Size(max = 255)
    @NotNull
    @Column(name = "title", nullable = false)
    private String title;

    @Size(max = 255)
    @NotNull
    @Column(name = "description", nullable = false)
    private String description;

    @NotNull
    @Column(name = "price", nullable = false)
    private int price;

    @NotNull
    @Column(name = "purchase_date", nullable = false)
    private String purchaseDate;

    @NotNull
    @Column(name = "grades", nullable = false)
    private Boolean grades = false;

    @NotNull
    @Column(name = "status", nullable = false)
    private Boolean status = true;

    @NotNull
    @Column(name = "configuration", nullable = false)
    private int configuration;

    @NotNull
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @NotNull
    @Column(name = "scratches_status", nullable = false)
    private String scratchesStatus;

    @Column(name = "serial_number", nullable = true)
    private String serialNumber;
}