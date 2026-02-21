package com.brdify.domain;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Timeline {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String milestone;
    private String description;

    // We'll store it as string for flexibility from LLM, or LocalDate if we enforce
    // formatting
    // Blueprint says "Extracted milestones", let's keep it flexible as String for
    // now to avoid parsing errors
    private String expectedDate;

    @ManyToOne
    @JoinColumn(name = "brd_document_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private BrdDocument brdDocument;
}
