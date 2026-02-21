package com.brdify.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class GroqService {

    @Value("${groq.api.key}")
    private String apiKey;

    private final String GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
    private final RestTemplate restTemplate = new RestTemplate();

    // Models mapped to specific tasks
    private static final String MODEL_EXTRACTION = "llama-3.3-70b-versatile"; // Replaced decommissioned mixtral model
    private static final String MODEL_SUMMARY = "llama-3.3-70b-versatile";
    private static final String MODEL_EDITING = "llama-3.1-8b-instant";

    public String extractRequirements(String context) {
        String systemPrompt = "You are a specialized business analyst. Your goal is to extract structured business requirements from the provided text. "
                + "Return the output as a JSON object with these keys: " +
                "'requirements' (list of strings), " +
                "'decisions' (list of strings), " +
                "'stakeholders' (list of formatted strings 'Name: Role'), " +
                "'risks' (list of objects with 'description', 'probability', 'impact', 'mitigation'), " +
                "'timeline' (list of objects with 'milestone', 'expectedDate', 'description').";

        String userMessage = "Analyze the following text and extract requirements:\n\n" + context;

        return callGroqApi(systemPrompt, userMessage, MODEL_EXTRACTION, 0.1);
    }

    public String generateExecutiveSummary(String context) {
        String systemPrompt = "You are an expert executive summarizer. Consolidate the provided business requirements and context into a professional, high-level Executive Summary.";
        String userMessage = "Please summarize the following extracted data for a BRD executive summary:\n\n" + context;

        return callGroqApi(systemPrompt, userMessage, MODEL_SUMMARY, 0.3);
    }

    public String editContent(String currentContent, String editInstruction) {
        String systemPrompt = "You are a precise document editor. Apply the user's editing instructions to the current content. ONLY return the final edited text without conversational filler.";
        String userMessage = "Current Content:\n" + currentContent + "\n\nEdit Instruction:\n" + editInstruction;

        return callGroqApi(systemPrompt, userMessage, MODEL_EDITING, 0.2);
    }

    private String callGroqApi(String systemPromptContent, String userMessageContent, String model,
            double temperature) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apiKey);
        headers.set("Content-Type", "application/json");

        Map<String, Object> body = new HashMap<>();
        body.put("model", model);

        Map<String, String> systemMessage = new HashMap<>();
        systemMessage.put("role", "system");
        systemMessage.put("content", systemPromptContent);

        Map<String, String> userMessage = new HashMap<>();
        userMessage.put("role", "user");
        userMessage.put("content", userMessageContent);

        body.put("messages", List.of(systemMessage, userMessage));
        body.put("temperature", temperature);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            @SuppressWarnings("unchecked")
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(GROQ_API_URL, HttpMethod.POST, entity,
                    (Class<Map<String, Object>>) (Class<?>) Map.class);
            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null && responseBody.containsKey("choices")) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
                if (!choices.isEmpty()) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    String groqResponse = (String) message.get("content");
                    log.info("Groq raw response: {}", groqResponse);
                    return groqResponse;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "{\"error\": \"Failed to call Groq API: " + e.getMessage() + "\"}";
        }
        return "{}";
    }
}
