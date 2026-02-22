package com.brdify.service;

import com.brdify.domain.*;
import com.brdify.repository.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BrdService {

    private final SourceDataRepository sourceDataRepository;
    private final BrdDocumentRepository brdDocumentRepository;
    private final GroqService groqService;
    private final ObjectMapper objectMapper;

    @Transactional
    public BrdDocument processSourceData(String content, String sourceType) {
        // 1. Save Source Data
        SourceData sourceData = new SourceData();
        sourceData.setContent(content);
        sourceData.setSourceType(sourceType);
        sourceDataRepository.save(sourceData);

        // 2. Preprocess
        String cleanedContent = new PreprocessingService().cleanText(content); // Using new instance if not autowired,
                                                                               // or better autowire it.
        // NOTE: I should validly autowire these services in the class first.

        // 3. Chunking
        List<String> chunks = new ChunkingService().splitIntoChunks(cleanedContent); // Same here, will fix
                                                                                     // imports/autowire in next step or
                                                                                     // use simple instantiation if
                                                                                     // stateless.

        // 4. Create BRD Document
        BrdDocument brdDocument = new BrdDocument();
        brdDocument.setTitle("BRD from " + sourceType);
        brdDocument.setStatus("DRAFT");
        brdDocument.setSourceData(sourceData);

        List<Requirement> requirements = new ArrayList<>();
        List<Decision> decisions = new ArrayList<>();
        List<Stakeholder> stakeholders = new ArrayList<>();
        List<Risk> risks = new ArrayList<>();
        List<Timeline> timelines = new ArrayList<>();

        // 5. Process each chunk
        for (String chunk : chunks) {
            String extractionJson = groqService.extractRequirements(chunk);
            try {
                // Extract only the JSON object, ignoring conversational text before/after
                String sanitizeJson = extractionJson;
                int startIdx = sanitizeJson.indexOf('{');
                int endIdx = sanitizeJson.lastIndexOf('}');
                if (startIdx != -1 && endIdx != -1 && endIdx >= startIdx) {
                    sanitizeJson = sanitizeJson.substring(startIdx, endIdx + 1);
                }

                JsonNode root = objectMapper.readTree(sanitizeJson);

                // Requirements
                if (root.has("requirements")) {
                    root.get("requirements").forEach(node -> {
                        Requirement req = new Requirement();
                        req.setDescription(node.asText());
                        req.setType("FUNCTIONAL");
                        req.setPriority("MEDIUM");
                        req.setBrdDocument(brdDocument);
                        requirements.add(req);
                    });
                }

                // Decisions
                if (root.has("decisions")) {
                    root.get("decisions").forEach(node -> {
                        Decision dec = new Decision();
                        dec.setDescription(node.asText());
                        dec.setStatus("PENDING");
                        dec.setBrdDocument(brdDocument);
                        decisions.add(dec);
                    });
                }

                // Stakeholders
                if (root.has("stakeholders")) {
                    root.get("stakeholders").forEach(node -> {
                        Stakeholder sh = new Stakeholder();
                        String raw = node.asText();
                        String[] parts = raw.split(":");
                        sh.setName(parts[0].trim());
                        if (parts.length > 1) {
                            sh.setRole(parts[1].trim());
                        }
                        sh.setBrdDocument(brdDocument);
                        stakeholders.add(sh);
                    });
                }

                // Risks
                if (root.has("risks")) {
                    root.get("risks").forEach(node -> {
                        Risk risk = new Risk();
                        if (node.isObject()) {
                            risk.setDescription(node.has("description") ? node.get("description").asText() : "");
                            risk.setProbability(node.has("probability") ? node.get("probability").asText() : "MEDIUM");
                            risk.setImpact(node.has("impact") ? node.get("impact").asText() : "MEDIUM");
                            risk.setMitigation(node.has("mitigation") ? node.get("mitigation").asText() : "");
                        } else {
                            // Fallback if LLM returns string
                            risk.setDescription(node.asText());
                        }
                        risk.setBrdDocument(brdDocument);
                        risks.add(risk);
                    });
                }

                // Timeline
                if (root.has("timeline")) {
                    root.get("timeline").forEach(node -> {
                        Timeline timeline = new Timeline();
                        if (node.isObject()) {
                            timeline.setMilestone(node.has("milestone") ? node.get("milestone").asText() : "");
                            timeline.setExpectedDate(node.has("expectedDate") ? node.get("expectedDate").asText() : "");
                            timeline.setDescription(node.has("description") ? node.get("description").asText() : "");
                        } else {
                            timeline.setMilestone(node.asText());
                        }
                        timeline.setBrdDocument(brdDocument);
                        timelines.add(timeline);
                    });
                }

            } catch (Exception e) {
                try {
                    java.io.StringWriter sw = new java.io.StringWriter();
                    e.printStackTrace(new java.io.PrintWriter(sw));
                    java.nio.file.Files.writeString(java.nio.file.Path.of("error_dump.txt"),
                            "Error: " + e.getMessage() + "\n" + sw.toString());
                } catch (Exception ignored) {
                }

                System.err.println("Failed to parse Groq extraction JSON. Chunk skipped.");
                System.err.println(e.getMessage());
                e.printStackTrace();
                throw new RuntimeException("Parser failed on JSON: " + extractionJson + " | Error: " + e.getMessage(),
                        e);
            }
        }

        brdDocument.setRequirements(requirements);
        brdDocument.setDecisions(decisions);
        brdDocument.setStakeholders(stakeholders);
        brdDocument.setRisks(risks);
        brdDocument.setTimelines(timelines);

        return brdDocumentRepository.save(brdDocument);
    }

    public BrdDocument getBrd(Long id) {
        return brdDocumentRepository.findById(id).orElseThrow();
    }

    @Transactional
    public BrdDocument updateBrd(Long id, BrdDocument updatedData) {
        BrdDocument existingBrd = brdDocumentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("BRD not found"));

        if (updatedData.getTitle() != null) {
            existingBrd.setTitle(updatedData.getTitle());
        }

        // Update Requirements
        existingBrd.getRequirements().clear();
        if (updatedData.getRequirements() != null) {
            updatedData.getRequirements().forEach(r -> {
                r.setId(null);
                r.setBrdDocument(existingBrd);
            });
            existingBrd.getRequirements().addAll(updatedData.getRequirements());
        }

        // Update Decisions
        existingBrd.getDecisions().clear();
        if (updatedData.getDecisions() != null) {
            updatedData.getDecisions().forEach(d -> {
                d.setId(null);
                d.setBrdDocument(existingBrd);
            });
            existingBrd.getDecisions().addAll(updatedData.getDecisions());
        }

        // Update Stakeholders
        existingBrd.getStakeholders().clear();
        if (updatedData.getStakeholders() != null) {
            updatedData.getStakeholders().forEach(s -> {
                s.setId(null);
                s.setBrdDocument(existingBrd);
            });
            existingBrd.getStakeholders().addAll(updatedData.getStakeholders());
        }

        // Update Risks
        existingBrd.getRisks().clear();
        if (updatedData.getRisks() != null) {
            updatedData.getRisks().forEach(r -> {
                r.setId(null);
                r.setBrdDocument(existingBrd);
            });
            existingBrd.getRisks().addAll(updatedData.getRisks());
        }

        // Update Timelines
        existingBrd.getTimelines().clear();
        if (updatedData.getTimelines() != null) {
            updatedData.getTimelines().forEach(t -> {
                t.setId(null);
                t.setBrdDocument(existingBrd);
            });
            existingBrd.getTimelines().addAll(updatedData.getTimelines());
        }

        return brdDocumentRepository.save(existingBrd);
    }
}
