package com.brdify.service;

import com.brdify.domain.RtmEntry;
import com.brdify.repository.RtmEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RtmService {

    private final RtmEntryRepository rtmEntryRepository;

    public List<RtmEntry> getRtmForBrd(Long brdId) {
        return rtmEntryRepository.findByBrdDocumentId(brdId);
    }
}
