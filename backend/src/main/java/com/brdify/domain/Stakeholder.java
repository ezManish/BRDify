package com.brdify.domain;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Stakeholder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String role;
    private String contactInfo;

    @ManyToOne
    @JoinColumn(name = "brd_document_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private BrdDocument brdDocument;
}
