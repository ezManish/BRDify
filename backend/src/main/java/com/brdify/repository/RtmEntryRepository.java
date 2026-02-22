package com.brdify.repository;

import com.brdify.domain.RtmEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RtmEntryRepository extends JpaRepository<RtmEntry, Long> {
    List<RtmEntry> findByBrdDocumentId(Long brdDocumentId);
}
