package com.example.raon.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.raon.domain.ChatbotMcpServer;

@Repository
public interface ChatbotMcpServerRepository extends JpaRepository<ChatbotMcpServer, Long> {
}
