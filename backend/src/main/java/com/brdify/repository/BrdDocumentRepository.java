package com.brdify.repository;

import com.brdify.domain.BrdDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BrdDocumentRepository extends JpaRepository<BrdDocument, Long> {
}
