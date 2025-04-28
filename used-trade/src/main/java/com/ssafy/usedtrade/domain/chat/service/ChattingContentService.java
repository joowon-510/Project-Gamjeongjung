package com.ssafy.usedtrade.domain.chat.service;

import com.ssafy.usedtrade.domain.chat.entity.ChattingContent;
import com.ssafy.usedtrade.domain.chat.entity.ChattingList;
import com.ssafy.usedtrade.domain.chat.repository.ChattingContentRepository;
import com.ssafy.usedtrade.domain.websocket.dto.request.ChatMessageDto;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChattingContentService {
    private final ChattingContentRepository chattingContentRepository;

    public void saveMessage(ChatMessageDto chatMessageDto) {
        chattingContentRepository.save(
                ChattingContent.builder()
                        .userId(Integer.parseInt(chatMessageDto.sender()))
                        .chattingList(ChattingList.builder()
                                .id(Integer.parseInt(chatMessageDto.roomId()))
                                .build())
                        .contents(chatMessageDto.message())
                        .createdAt(LocalDateTime.now())
                        .build());
    }
}
