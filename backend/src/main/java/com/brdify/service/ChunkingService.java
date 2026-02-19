package com.brdify.service;

import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class ChunkingService {

    private static final int MAX_CHUNK_SIZE = 12000; // Characters (~3000-4000 tokens)
    private static final int OVERLAP_SIZE = 500; // Characters to overlap for context continuity

    public List<String> splitIntoChunks(String text) {
        List<String> chunks = new ArrayList<>();
        if (text == null || text.isEmpty()) {
            return chunks;
        }

        if (text.length() <= MAX_CHUNK_SIZE) {
            chunks.add(text);
            return chunks;
        }

        int start = 0;
        while (start < text.length()) {
            int end = Math.min(start + MAX_CHUNK_SIZE, text.length());

            // Try to find a paragraph break or sentence end to split cleanly
            if (end < text.length()) {
                int lastNewline = text.lastIndexOf("\n", end);
                int lastPeriod = text.lastIndexOf(".", end);

                if (lastNewline > start + (MAX_CHUNK_SIZE / 2)) {
                    end = lastNewline + 1; // Include the newline
                } else if (lastPeriod > start + (MAX_CHUNK_SIZE / 2)) {
                    end = lastPeriod + 1; // Include the period
                }
            }

            chunks.add(text.substring(start, end));

            // Move start forward, subtracting overlap unless we're at the end
            start = end - OVERLAP_SIZE;

            // Avoid infinite loops if overlap pushes us back too far or same spot (though
            // logic above should prevent)
            if (start >= end)
                start = end;
            // Ensure next start is advanced at least by 1 if strict overlap fails
            if (start <= (end - MAX_CHUNK_SIZE))
                start = end; // Just a safety, logic implies start < end

            // Correct logic: next chunk starts at 'end' minus overlap, BUT we need to
            // ensure we don't re-process too much.
            // Actually, simplest overlapping window:
            // start = start + (MAX_CHUNK_SIZE - OVERLAP_SIZE) could miss

            // Let's stick to the calculated 'end' minus overlap for the next 'start'
            // If we split at a clean break (newline), we might not need overlap, but let's
            // keep it for safety in LLM context.
            // However, duplicating content might cause duplicate requirements.
            // For BRD extraction, simple splitting by paragraphs is often better than
            // strict sliding window.

            // Revised strategy: Strict partition by paragraph without overlap if possible,
            // or overlap if no massive break.
            // Let's use the simple calculated 'end' and just set start = end for now to
            // avoid duplication issues in extraction.
            // Overlap is good for Q&A, but for Extraction, it causes duplicates.
            start = end;
        }

        return chunks;
    }
}
