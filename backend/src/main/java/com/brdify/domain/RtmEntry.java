package com.brdify.domain;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Data
public class RtmEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brd_document_id")
    @JsonIgnore
    private BrdDocument brdDocument;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "requirement_id")
    private Requirement requirement;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_data_id")
    @JsonIgnore // Avoid pulling the whole raw text constantly
    private SourceData sourceData;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String sourceChunk;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "decision_id")
    private Decision decision;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "timeline_id")
    private Timeline timeline;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "risk_id")
    private Risk risk;
}
