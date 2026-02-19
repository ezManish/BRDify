package com.brdify.service;

import org.springframework.stereotype.Service;
import java.util.regex.Pattern;

@Service
public class PreprocessingService {

    // Regex to identify common email headers and footers
    private static final Pattern EMAIL_HEADER_PATTERN = Pattern.compile("^(From:|To:|Sent:|Subject:).*",
            Pattern.MULTILINE | Pattern.CASE_INSENSITIVE);
    private static final Pattern DISCLAIMER_PATTERN = Pattern.compile("Disclaimer:.*|Confidentiality Notice:.*",
            Pattern.CASE_INSENSITIVE);

    public String cleanText(String input) {
        if (input == null || input.isEmpty()) {
            return "";
        }

        // 1. Normalize line endings
        String cleaned = input.replace("\r\n", "\n").replace("\r", "\n");

        // 2. Remove multiple empty lines (preserve paragraph breaks but remove
        // excessive spacing)
        cleaned = cleaned.replaceAll("\n{3,}", "\n\n");

        // 3. Remove email headers (basic)
        cleaned = EMAIL_HEADER_PATTERN.matcher(cleaned).replaceAll("");

        // 4. Remove generic disclaimers (basic)
        cleaned = DISCLAIMER_PATTERN.matcher(cleaned).replaceAll("");

        // 5. Trim whitespace
        return cleaned.trim();
    }
}
