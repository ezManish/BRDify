package com.brdify.domain;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Decision {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String description;

    private String status; // AGREED, PENDING, REJECTED

    @ManyToOne
    @JoinColumn(name = "brd_document_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private BrdDocument brdDocument;
}
