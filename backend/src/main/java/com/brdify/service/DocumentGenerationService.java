package com.brdify.service;

import com.brdify.domain.BrdDocument;
import com.lowagie.text.Document;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Service
public class DocumentGenerationService {

    public byte[] generatePdf(BrdDocument brd) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();

            document.add(new Paragraph("PRODUCED BY BRDIFY"));
            document.add(new Paragraph("Title: " + brd.getTitle()));
            document.add(new Paragraph("\n"));

            if (brd.getRequirements() != null && !brd.getRequirements().isEmpty()) {
                document.add(new Paragraph("Requirements:"));
                for (var req : brd.getRequirements()) {
                    document.add(new Paragraph("- " + req.getDescription()));
                }
                document.add(new Paragraph("\n"));
            }

            if (brd.getDecisions() != null && !brd.getDecisions().isEmpty()) {
                document.add(new Paragraph("Decisions:"));
                for (var dec : brd.getDecisions()) {
                    document.add(new Paragraph("- " + dec.getDescription()));
                }
                document.add(new Paragraph("\n"));
            }

            if (brd.getStakeholders() != null && !brd.getStakeholders().isEmpty()) {
                document.add(new Paragraph("Stakeholders:"));
                for (var sh : brd.getStakeholders()) {
                    document.add(new Paragraph("- " + sh.getName() + " (" + sh.getRole() + ")"));
                }
                document.add(new Paragraph("\n"));
            }

            if (brd.getRisks() != null && !brd.getRisks().isEmpty()) {
                document.add(new Paragraph("Risks:"));
                for (var risk : brd.getRisks()) {
                    document.add(new Paragraph("- " + risk.getDescription() + " (Impact: " + risk.getImpact()
                            + ", Mitigation: " + risk.getMitigation() + ")"));
                }
                document.add(new Paragraph("\n"));
            }

            if (brd.getTimelines() != null && !brd.getTimelines().isEmpty()) {
                document.add(new Paragraph("Timeline:"));
                for (var time : brd.getTimelines()) {
                    document.add(new Paragraph("- " + time.getMilestone() + " (Date: " + time.getExpectedDate() + ") - "
                            + time.getDescription()));
                }
            }

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF", e);
        }
    }

    public byte[] generateDocx(BrdDocument brd) {
        try (XWPFDocument document = new XWPFDocument();
                ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            XWPFParagraph title = document.createParagraph();
            XWPFRun titleRun = title.createRun();
            titleRun.setText("PRODUCED BY BRDIFY - " + brd.getTitle());
            titleRun.setBold(true);
            titleRun.setFontSize(16);

            if (brd.getRequirements() != null && !brd.getRequirements().isEmpty()) {
                addDocxSectionHeader(document, "Requirements:");
                for (var req : brd.getRequirements())
                    addDocxBullet(document, req.getDescription());
            }

            if (brd.getDecisions() != null && !brd.getDecisions().isEmpty()) {
                addDocxSectionHeader(document, "Decisions:");
                for (var dec : brd.getDecisions())
                    addDocxBullet(document, dec.getDescription());
            }

            if (brd.getStakeholders() != null && !brd.getStakeholders().isEmpty()) {
                addDocxSectionHeader(document, "Stakeholders:");
                for (var sh : brd.getStakeholders())
                    addDocxBullet(document, sh.getName() + " (" + sh.getRole() + ")");
            }

            if (brd.getRisks() != null && !brd.getRisks().isEmpty()) {
                addDocxSectionHeader(document, "Risks:");
                for (var risk : brd.getRisks())
                    addDocxBullet(document, risk.getDescription() + " (Impact: " + risk.getImpact() + ", Mitigation: "
                            + risk.getMitigation() + ")");
            }

            if (brd.getTimelines() != null && !brd.getTimelines().isEmpty()) {
                addDocxSectionHeader(document, "Timeline:");
                for (var time : brd.getTimelines())
                    addDocxBullet(document,
                            time.getMilestone() + " (Date: " + time.getExpectedDate() + ") - " + time.getDescription());
            }

            document.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Error generating DOCX", e);
        }
    }

    private void addDocxSectionHeader(XWPFDocument document, String header) {
        XWPFParagraph p = document.createParagraph();
        p.setSpacingBefore(200);
        XWPFRun run = p.createRun();
        run.setText(header);
        run.setBold(true);
        run.setFontSize(14);
    }

    private void addDocxBullet(XWPFDocument document, String text) {
        XWPFParagraph p = document.createParagraph();
        XWPFRun r = p.createRun();
        r.setText("- " + text);
    }
}
