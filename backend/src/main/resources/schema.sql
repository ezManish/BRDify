CREATE TABLE IF NOT EXISTS source_data (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    source_type VARCHAR(50), -- EMAIL, TRANSCRIPT, DOCUMENT
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS brd_document (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    status VARCHAR(50), -- DRAFT, GENERATED, APPROVED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    source_data_id BIGINT,
    FOREIGN KEY (source_data_id) REFERENCES source_data(id)
);

CREATE TABLE IF NOT EXISTS requirement (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    description TEXT NOT NULL,
    type VARCHAR(50), -- FUNCTIONAL, NON_FUNCTIONAL
    priority VARCHAR(50), -- HIGH, MEDIUM, LOW
    brd_document_id BIGINT,
    FOREIGN KEY (brd_document_id) REFERENCES brd_document(id)
);

CREATE TABLE IF NOT EXISTS decision (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    description TEXT NOT NULL,
    status VARCHAR(50), -- AGREED, PENDING, REJECTED
    brd_document_id BIGINT,
    FOREIGN KEY (brd_document_id) REFERENCES brd_document(id)
);

CREATE TABLE IF NOT EXISTS stakeholder (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255),
    contact_info VARCHAR(255),
    brd_document_id BIGINT,
    FOREIGN KEY (brd_document_id) REFERENCES brd_document(id)
);
