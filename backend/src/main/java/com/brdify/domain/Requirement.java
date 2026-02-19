package com.brdify.domain;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Requirement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String description;

    private String type; // FUNCTIONAL, NON_FUNCTIONAL
    private String priority; // HIGH, MEDIUM, LOW

    @ManyToOne
    @JoinColumn(name = "brd_document_id")
    private BrdDocument brdDocument;
}
