package com.example.raon.repository;

import com.example.raon.domain.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

    Optional<ChatRoom> findByPersoSessionId(String persoSessionId);

    boolean existsByPersoSessionId(String persoSessionId);
}
