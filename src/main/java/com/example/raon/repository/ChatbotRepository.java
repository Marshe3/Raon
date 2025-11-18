package com.example.raon.repository;

import com.example.raon.domain.Chatbot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatbotRepository extends JpaRepository<Chatbot, Long> {

    /**
     * 활성화된 챗봇만 조회
     */
    List<Chatbot> findByIsActiveTrue();

    /**
     * 공개된 챗봇만 조회
     */
    List<Chatbot> findByIsPublicTrue();

    /**
     * 활성화되고 공개된 챗봇만 조회
     */
    List<Chatbot> findByIsActiveTrueAndIsPublicTrue();

    /**
     * ID로 활성화된 챗봇 조회
     */
    Optional<Chatbot> findByIdAndIsActiveTrue(Long id);
}
