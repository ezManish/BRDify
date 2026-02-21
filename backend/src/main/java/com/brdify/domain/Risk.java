package com.brdify.domain;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Risk {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String probability; // LOW, MEDIUM, HIGH
    private String impact; // LOW, MEDIUM, HIGH
    private String mitigation; // Proposed mitigation strategy

    @ManyToOne
    @JoinColumn(name = "brd_document_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private BrdDocument brdDocument;
}
