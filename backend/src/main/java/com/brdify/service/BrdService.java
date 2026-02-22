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

        // Generate Executive Summary
        String executiveSummary = groqService.generateExecutiveSummary(cleanedContent);
        brdDocument.setSummary(executiveSummary);

        List<Requirement> requirements = new ArrayList<>();
        List<Decision> decisions = new ArrayList<>();
        List<Stakeholder> stakeholders = new ArrayList<>();
        List<Risk> risks = new ArrayList<>();
        List<Timeline> timelines = new ArrayList<>();
        List<RtmEntry> rtmEntries = new ArrayList<>();

        // Cache structures for deferred RTM mapping post-JPA save
        List<JsonNode> chunkRoots = new ArrayList<>();
        java.util.Map<JsonNode, List<Requirement>> chunkRootReqs = new java.util.HashMap<>();
        java.util.Map<JsonNode, List<Decision>> chunkRootDecs = new java.util.HashMap<>();
        java.util.Map<JsonNode, List<Risk>> chunkRootRisks = new java.util.HashMap<>();
        java.util.Map<JsonNode, List<Timeline>> chunkRootTimes = new java.util.HashMap<>();
        java.util.Map<JsonNode, String> chunkRootTexts = new java.util.HashMap<>();
        java.util.Map<JsonNode, java.util.Map<Requirement, String>> rootReqQuotes = new java.util.IdentityHashMap<>();
        java.util.Map<JsonNode, java.util.Map<Requirement, Integer>> rootReqToDec = new java.util.IdentityHashMap<>();
        java.util.Map<JsonNode, java.util.Map<Requirement, Integer>> rootReqToRisk = new java.util.IdentityHashMap<>();
        java.util.Map<JsonNode, java.util.Map<Requirement, Integer>> rootReqToTime = new java.util.IdentityHashMap<>();

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

                List<Requirement> chunkReqs = new ArrayList<>();
                java.util.Map<Requirement, String> reqQuotes = new java.util.IdentityHashMap<>();
                java.util.Map<Requirement, Integer> reqToDec = new java.util.IdentityHashMap<>();
                java.util.Map<Requirement, Integer> reqToRisk = new java.util.IdentityHashMap<>();
                java.util.Map<Requirement, Integer> reqToTime = new java.util.IdentityHashMap<>();

                List<Decision> chunkDecs = new ArrayList<>();
                List<Risk> chunkRisks = new ArrayList<>();
                List<Timeline> chunkTimes = new ArrayList<>();

                chunkRoots.add(root);
                chunkRootReqs.put(root, chunkReqs);
                chunkRootDecs.put(root, chunkDecs);
                chunkRootRisks.put(root, chunkRisks);
                chunkRootTimes.put(root, chunkTimes);
                rootReqQuotes.put(root, reqQuotes);
                rootReqToDec.put(root, reqToDec);
                rootReqToRisk.put(root, reqToRisk);
                rootReqToTime.put(root, reqToTime);
                chunkRootTexts.put(root, chunk);

                // Requirements
                if (root.has("requirements")) {
                    root.get("requirements").forEach(node -> {
                        Requirement req = new Requirement();
                        String quote = chunk; // Default to whole chunk if quote missing
                        if (node.isObject()) {
                            req.setDescription(node.has("description") ? node.get("description").asText() : "");
                            if (node.has("sourceQuote")) {
                                quote = node.get("sourceQuote").asText();
                            }
                            if (node.has("relatedDecisionIndex") && !node.get("relatedDecisionIndex").isNull()) {
                                reqToDec.put(req, node.get("relatedDecisionIndex").asInt());
                            }
                            if (node.has("relatedRiskIndex") && !node.get("relatedRiskIndex").isNull()) {
                                reqToRisk.put(req, node.get("relatedRiskIndex").asInt());
                            }
                            if (node.has("relatedTimelineIndex") && !node.get("relatedTimelineIndex").isNull()) {
                                reqToTime.put(req, node.get("relatedTimelineIndex").asInt());
                            }
                        } else {
                            req.setDescription(node.asText());
                        }
                        req.setSourceQuote(quote);
                        req.setType("FUNCTIONAL");
                        req.setPriority("MEDIUM");
                        req.setBrdDocument(brdDocument);
                        requirements.add(req);
                        chunkReqs.add(req);
                        reqQuotes.put(req, quote);
                    });
                }

                // Decisions
                if (root.has("decisions")) {
                    root.get("decisions").forEach(node -> {
                        Decision dec = new Decision();
                        if (node.isObject() && node.has("description")) {
                            dec.setDescription(node.get("description").asText());
                        } else {
                            dec.setDescription(node.asText());
                        }
                        dec.setStatus("PENDING");
                        dec.setBrdDocument(brdDocument);
                        decisions.add(dec);
                        chunkDecs.add(dec);
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
                        chunkRisks.add(risk);
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
                        chunkTimes.add(timeline);
                    });
                }

                // Mappings deferred until after JPA saves entities so ForeignKeys populate ids

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

        // Save BrdDocument first so children get their IDs
        BrdDocument savedDoc = brdDocumentRepository.save(brdDocument);

        // Now map the explicit indices to the saved list elements which have real IDs
        List<RtmEntry> savedRtmEntries = new ArrayList<>();
        int chunkReqIndexStart = 0;

        for (JsonNode root : chunkRoots) {
            List<Requirement> chunkReqs = chunkRootReqs.get(root);
            List<Decision> chunkDecs = chunkRootDecs.get(root);
            List<Risk> chunkRisks = chunkRootRisks.get(root);
            List<Timeline> chunkTimes = chunkRootTimes.get(root);
            String chunkQuoteText = chunkRootTexts.get(root);
            java.util.Map<Requirement, String> reqQuotes = rootReqQuotes.get(root);
            java.util.Map<Requirement, Integer> reqToDec = rootReqToDec.get(root);
            java.util.Map<Requirement, Integer> reqToRisk = rootReqToRisk.get(root);
            java.util.Map<Requirement, Integer> reqToTime = rootReqToTime.get(root);

            for (int i = 0; i < chunkReqs.size(); i++) {
                Requirement originalReq = chunkReqs.get(i);
                // Locate the real saved requirement object
                Requirement savedReq = savedDoc.getRequirements().get(chunkReqIndexStart + i);

                RtmEntry rtm = new RtmEntry();
                rtm.setBrdDocument(savedDoc);
                rtm.setRequirement(savedReq);
                rtm.setSourceData(sourceData);
                rtm.setSourceChunk(reqQuotes.getOrDefault(originalReq, chunkQuoteText));

                Integer relDecIdx = reqToDec.get(originalReq);
                if (relDecIdx != null && relDecIdx >= 0 && relDecIdx < chunkDecs.size()) {
                    // find index in the saved document matching this chunk's subset
                    int globalDecIdx = savedDoc.getDecisions().indexOf(chunkDecs.get(relDecIdx));
                    if (globalDecIdx != -1)
                        rtm.setDecision(savedDoc.getDecisions().get(globalDecIdx));
                }

                Integer relRiskIdx = reqToRisk.get(originalReq);
                if (relRiskIdx != null && relRiskIdx >= 0 && relRiskIdx < chunkRisks.size()) {
                    int globalRiskIdx = savedDoc.getRisks().indexOf(chunkRisks.get(relRiskIdx));
                    if (globalRiskIdx != -1)
                        rtm.setRisk(savedDoc.getRisks().get(globalRiskIdx));
                }

                Integer relTimeIdx = reqToTime.get(originalReq);
                if (relTimeIdx != null && relTimeIdx >= 0 && relTimeIdx < chunkTimes.size()) {
                    int globalTimeIdx = savedDoc.getTimelines().indexOf(chunkTimes.get(relTimeIdx));
                    if (globalTimeIdx != -1)
                        rtm.setTimeline(savedDoc.getTimelines().get(globalTimeIdx));
                }
                savedRtmEntries.add(rtm);
            }
            chunkReqIndexStart += chunkReqs.size();
        }

        savedDoc.setRtmEntries(savedRtmEntries);
        return brdDocumentRepository.save(savedDoc);
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

        if (updatedData.getSummary() != null) {
            existingBrd.setSummary(updatedData.getSummary());
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

        // Preserve and Remap RTM Entries
        // Since the UI array orders are preserved in the DOM list,
        // we map the old AI source chunks onto the newly overwritten requirement DB
        // objects.
        if (existingBrd.getRtmEntries() != null && updatedData.getRequirements() != null) {
            List<RtmEntry> oldRtms = new ArrayList<>(existingBrd.getRtmEntries());
            existingBrd.getRtmEntries().clear();

            for (int i = 0; i < existingBrd.getRequirements().size(); i++) {
                if (i < oldRtms.size()) {
                    RtmEntry oldRtm = oldRtms.get(i);
                    RtmEntry newRtm = new RtmEntry();
                    newRtm.setBrdDocument(existingBrd);
                    newRtm.setRequirement(existingBrd.getRequirements().get(i));
                    newRtm.setSourceData(oldRtm.getSourceData());
                    newRtm.setSourceChunk(oldRtm.getSourceChunk());

                    // Remap Risk/Decision/Timeline links based on list indexes if they still exist
                    // Note: This relies on the UI preserving relative ordering.
                    if (oldRtm.getDecision() != null && existingBrd.getDecisions() != null) {
                        int oldIdx = -1;
                        for (int j = 0; j < oldRtms.size(); j++) {
                            if (oldRtms.get(j).getDecision() != null
                                    && oldRtms.get(j).getDecision().getId().equals(oldRtm.getDecision().getId())) {
                                oldIdx = j;
                                break;
                            }
                        }
                        if (oldIdx != -1 && oldIdx < existingBrd.getDecisions().size()) {
                            newRtm.setDecision(existingBrd.getDecisions().get(oldIdx));
                        }
                    }
                    if (oldRtm.getRisk() != null && existingBrd.getRisks() != null) {
                        int oldIdx = -1;
                        for (int j = 0; j < oldRtms.size(); j++) {
                            if (oldRtms.get(j).getRisk() != null
                                    && oldRtms.get(j).getRisk().getId().equals(oldRtm.getRisk().getId())) {
                                oldIdx = j;
                                break;
                            }
                        }
                        if (oldIdx != -1 && oldIdx < existingBrd.getRisks().size()) {
                            newRtm.setRisk(existingBrd.getRisks().get(oldIdx));
                        }
                    }
                    if (oldRtm.getTimeline() != null && existingBrd.getTimelines() != null) {
                        int oldIdx = -1;
                        for (int j = 0; j < oldRtms.size(); j++) {
                            if (oldRtms.get(j).getTimeline() != null
                                    && oldRtms.get(j).getTimeline().getId().equals(oldRtm.getTimeline().getId())) {
                                oldIdx = j;
                                break;
                            }
                        }
                        if (oldIdx != -1 && oldIdx < existingBrd.getTimelines().size()) {
                            newRtm.setTimeline(existingBrd.getTimelines().get(oldIdx));
                        }
                    }
                    existingBrd.getRtmEntries().add(newRtm);
                }
            }
        }

        return brdDocumentRepository.save(existingBrd);
    }
}
