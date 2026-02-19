package com.brdify.repository;

import com.brdify.domain.SourceData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SourceDataRepository extends JpaRepository<SourceData, Long> {
}
