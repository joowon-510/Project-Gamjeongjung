package com.ssafy.usedtrade.domain.chat.controller;

import com.ssafy.usedtrade.common.response.Api;
import com.ssafy.usedtrade.domain.auth.entity.SecurityMemberDetails;
import com.ssafy.usedtrade.domain.chat.dto.ChatContentResponse;
import com.ssafy.usedtrade.domain.chat.dto.ChatListResponse;
import com.ssafy.usedtrade.domain.chat.dto.ChatRoomCreateRequest;
import com.ssafy.usedtrade.domain.chat.service.ChatService;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Slice;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/chatting")
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;

    @GetMapping("/userId")
    public Api<Map<String, String>> returnUserId(
            @AuthenticationPrincipal SecurityMemberDetails memberDetails) {

        Map<String, String> map = new HashMap<>();
        map.put("userId", String.valueOf(memberDetails.getId()));
        return Api.OK(map);
    }

    @PostMapping
    public Api<Void> createChatRoom(
            @AuthenticationPrincipal SecurityMemberDetails memberDetails,
            @RequestBody ChatRoomCreateRequest createRequest
    ) {
        chatService.createChatRoom(memberDetails.getId(), createRequest);
        return Api.OK();
    }

    // roomid 암호화
    @GetMapping
    public Api<Slice<ChatListResponse>> findAllMyChatRoom(
            @RequestParam(value = "last-chat-time", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime lastChatTime,
            @AuthenticationPrincipal SecurityMemberDetails memberDetails
    ) {
        return Api.OK(chatService.findAllMyChatRoom(memberDetails.getId(), lastChatTime));
    }

    // roomid 암호화
    @GetMapping("/{roomId}")
    public Api<Slice<ChatContentResponse>> findMyChat(
            @PathVariable String roomId,
            @AuthenticationPrincipal SecurityMemberDetails memberDetails,
            @RequestParam(value = "created-at", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime createdAt
    ) {
        return Api.OK(chatService.findAllMyChat(memberDetails.getId(), roomId, createdAt));
    }

    @DeleteMapping("/{roomId}")
    public Api<Void> deleteChatRoom(
            @PathVariable String roomId,
            @AuthenticationPrincipal SecurityMemberDetails memberDetails
    ) {
        chatService.deleteMyChatRoom(memberDetails.getId(), roomId);
        return Api.OK();
    }
}
