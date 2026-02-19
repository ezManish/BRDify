package com.brdify.service;

import com.brdify.domain.BrdDocument;
import com.brdify.domain.Requirement;
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
            document.add(new Paragraph("\n"));
            document.add(new Paragraph("Title: " + brd.getTitle()));
            document.add(new Paragraph("\n"));

            document.add(new Paragraph("Requirements:"));
            for (Requirement req : brd.getRequirements()) {
                document.add(new Paragraph("- " + req.getDescription()));
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
            titleRun.setText("Title: " + brd.getTitle());
            titleRun.setBold(true);
            titleRun.setFontSize(16);

            XWPFParagraph reqHeader = document.createParagraph();
            XWPFRun reqRun = reqHeader.createRun();
            reqRun.setText("Requirements:");
            reqRun.setBold(true);

            for (Requirement req : brd.getRequirements()) {
                XWPFParagraph p = document.createParagraph();
                XWPFRun r = p.createRun();
                r.setText("- " + req.getDescription());
            }

            document.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Error generating DOCX", e);
        }
    }
}
