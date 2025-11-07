package com.example.raon.repository;

import com.example.raon.domain.Chatbot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatbotRepository extends JpaRepository<Chatbot, Long> {
    
    List<Chatbot> findByIsActiveTrue();
    
    List<Chatbot> findByIsPublicTrue();
    
    @Query("SELECT c FROM Chatbot c WHERE c.isActive = true AND c.isPublic = true ORDER BY c.createdAt DESC")
    List<Chatbot> findPublicChatbots();
    
    List<Chatbot> findByChatbotNameContaining(String name);
}