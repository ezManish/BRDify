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

@Service
public class GroqService {

    @Value("${groq.api.key}")
    private String apiKey;

    private final String GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
    private final RestTemplate restTemplate = new RestTemplate();

    public String extractRequirements(String context) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apiKey);
        headers.set("Content-Type", "application/json");

        Map<String, Object> body = new HashMap<>();
        body.put("model", "mixtral-8x7b-32768"); // or other Groq models

        Map<String, String> systemMessage = new HashMap<>();
        systemMessage.put("role", "system");
        systemMessage.put("content",
                "You are a specialized business analyst. Your goal is to extract structured business requirements from the provided text. "
                        +
                        "Return the output as a JSON object with these keys: " +
                        "'requirements' (list of strings), " +
                        "'decisions' (list of strings), " +
                        "'stakeholders' (list of formatted strings 'Name: Role'), " + /* Updated below */
                        "'risks' (list of objects with 'description', 'probability', 'impact', 'mitigation'), " +
                        "'timeline' (list of objects with 'milestone', 'expectedDate', 'description').");

        Map<String, String> userMessage = new HashMap<>();
        userMessage.put("role", "user");
        userMessage.put("content", "Analyze the following text and extract requirements:\n\n" + context);

        body.put("messages", List.of(systemMessage, userMessage));
        body.put("temperature", 0.1);

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
                    return (String) message.get("content");
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "{\"error\": \"Failed to extract requirements: " + e.getMessage() + "\"}";
        }
        return "{}";
    }
}
