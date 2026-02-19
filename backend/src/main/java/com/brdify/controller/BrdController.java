package com.brdify.controller;

import com.brdify.domain.BrdDocument;
import com.brdify.service.BrdService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Allow frontend to call
@RequiredArgsConstructor
public class BrdController {

    private final BrdService brdService;
    private final com.brdify.service.DocumentGenerationService documentGenerationService;

    @PostMapping("/upload")
    public ResponseEntity<BrdDocument> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            String content = new String(file.getBytes(), StandardCharsets.UTF_8);
            String sourceType = file.getOriginalFilename().endsWith(".txt") ? "TRANSCRIPT" : "DOCUMENT";

            BrdDocument brd = brdService.processSourceData(content, sourceType);
            return ResponseEntity.ok(brd);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/upload-text")
    public ResponseEntity<BrdDocument> uploadText(@RequestBody String content) {
        BrdDocument brd = brdService.processSourceData(content, "TEXT_INPUT");
        return ResponseEntity.ok(brd);
    }

    @GetMapping("/brd/{id}")
    public ResponseEntity<BrdDocument> getBrd(@PathVariable Long id) {
        return ResponseEntity.ok(brdService.getBrd(id));
    }

    @GetMapping("/brd/{id}/pdf")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable Long id) {
        BrdDocument brd = brdService.getBrd(id);
        byte[] pdfBytes = documentGenerationService.generatePdf(brd);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=brd-" + id + ".pdf")
                .header("Content-Type", "application/pdf")
                .body(pdfBytes);
    }

    @GetMapping("/brd/{id}/docx")
    public ResponseEntity<byte[]> downloadDocx(@PathVariable Long id) {
        BrdDocument brd = brdService.getBrd(id);
        byte[] docxBytes = documentGenerationService.generateDocx(brd);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=brd-" + id + ".docx")
                .header("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
                .body(docxBytes);
    }
}
