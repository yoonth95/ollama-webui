import { useEffect, useRef, useCallback } from "react";
import { useChatUIStore, ErrorType } from "@/shared/stores/useChatUIStore";

/**
 * 오류 메시지에서 오류 타입 추론
 */
const detectErrorType = (message: string): ErrorType => {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("network") || lowerMessage.includes("연결") || lowerMessage.includes("connection")) {
    return "network";
  }

  if (lowerMessage.includes("timeout") || lowerMessage.includes("시간 초과") || lowerMessage.includes("시간이 초과")) {
    return "timeout";
  }

  if (lowerMessage.includes("model") || lowerMessage.includes("모델") || lowerMessage.includes("load")) {
    return "model";
  }

  if (lowerMessage.includes("content") || lowerMessage.includes("내용") || lowerMessage.includes("정책")) {
    return "content";
  }

  return "unknown";
};

/**
 * SSE 연결을 관리하는 커스텀 훅
 * @param roomId 채팅방 ID
 */
export const useSSEConnection = (roomId: string | undefined) => {
  const eventSourceRef = useRef<EventSource | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageRef = useRef<number>(0);
  const connectionAttemptsRef = useRef<number>(0);
  const MAX_RECONNECT_ATTEMPTS = 3;

  const { updateBotResponse, setIsStreaming, setLoading, setError, updateBotMetadata } = useChatUIStore();

  // 일정 시간 메시지가 없으면 스트리밍 종료 - useCallback으로 메모이제이션
  const setupInactivityTimeout = useCallback(() => {
    // 이전 타임아웃 정리
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 30초 동안 메시지가 없으면 연결 종료
    timeoutRef.current = setTimeout(() => {
      const now = Date.now();
      // 마지막 메시지 이후 30초 이상 경과 시 연결 종료
      if (now - lastMessageRef.current > 30000) {
        console.log("메시지 없음 타임아웃: SSE 연결 종료");

        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }

        setIsStreaming(false);
        setError(true, "응답 생성 시간이 초과되었습니다.", "timeout");
      } else {
        // 아직 활성 상태면 타임아웃 다시 설정
        setupInactivityTimeout();
      }
    }, 5000); // 5초마다 체크
  }, [setIsStreaming, setError]);

  // SSE 연결 초기화 - 기존 연결 종료 후 새로 연결
  const connectSSE = useCallback(() => {
    // 채팅방 ID가 없으면 연결하지 않음
    if (!roomId) return;

    // 재시도 횟수 초과 시 연결 중단
    if (connectionAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      setError(true, "서버 연결을 여러 번 시도했으나 실패했습니다.", "network");
      return;
    }

    connectionAttemptsRef.current++;

    // 새로운 SSE 연결 생성 - 프록시를 활용하기 위해 상대 경로 사용
    const eventSource = new EventSource(`/api/v1/chat/stream/${roomId}`);
    eventSourceRef.current = eventSource;
    setIsStreaming(true);

    // 현재 시간 기록
    lastMessageRef.current = Date.now();

    // 비활성 타임아웃 설정
    setupInactivityTimeout();

    // 메시지 이벤트 리스너
    eventSource.onmessage = (event) => {
      // 메시지 수신 시간 갱신
      lastMessageRef.current = Date.now();

      try {
        const data = JSON.parse(event.data);

        // 오류 메시지 확인
        if (data.error) {
          const errorMessage = data.message || "모델 응답 생성 중 오류가 발생했습니다.";
          const errorType = detectErrorType(errorMessage);

          setError(true, errorMessage, errorType);

          // 연결 종료
          if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
          }

          setIsStreaming(false);
          return;
        }

        // 초기 저장된 전체 응답이 있는 경우
        if (data.init && data.full) {
          updateBotResponse(data.full);

          // 모델명과 생성 시간 정보가 있으면 저장
          if (data.model) {
            updateBotMetadata(data.model, data.created_at || null);
          }

          setLoading(false);

          // 완성된 응답인 경우 스트리밍 상태 종료
          if (data.done) {
            setIsStreaming(false);

            // 타임아웃 정리
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }

            // 커넥션 종료
            if (eventSourceRef.current) {
              eventSourceRef.current.close();
              eventSourceRef.current = null;
            }
          }

          return;
        }

        // 증분 응답인 경우
        if (data.full) {
          updateBotResponse(data.full);

          // 모델명과 생성 시간 정보가 있으면 저장
          if (data.model) {
            updateBotMetadata(data.model, data.created_at || null);
          }

          setLoading(false);

          // 완성된 응답인 경우 스트리밍 상태 종료
          if (data.done) {
            setIsStreaming(false);

            // 타임아웃 정리
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }

            // 커넥션 종료
            if (eventSourceRef.current) {
              eventSourceRef.current.close();
              eventSourceRef.current = null;
            }
          }
        }
      } catch (error) {
        console.error("SSE 메시지 파싱 오류:", error);
        setError(true, "응답 데이터 처리 중 오류가 발생했습니다.", "unknown");
      }
    };

    // 연결 성공 이벤트 리스너 추가
    eventSource.onopen = () => {
      console.log("SSE 연결 성공!");
      // 연결 성공 시 시도 횟수 초기화
      connectionAttemptsRef.current = 0;
      lastMessageRef.current = Date.now();
      setLoading(false);
    };

    // 에러 이벤트 리스너
    eventSource.onerror = (error) => {
      console.error("SSE 연결 오류:", error);

      // 타임아웃 정리
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // 연결 닫기
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      // 연결 오류에 따른 처리
      if (connectionAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        // 1초 후 재연결 시도
        setTimeout(() => connectSSE(), 1000);
      } else {
        setError(true, "서버 연결 오류가 지속되고 있습니다. 나중에 다시 시도해주세요.", "network");
        setIsStreaming(false);
      }
    };
  }, [roomId, updateBotResponse, updateBotMetadata, setIsStreaming, setLoading, setError, setupInactivityTimeout]);

  // 서버 연결 재시도 함수 (새로운 Ollama API 호출 요청)
  const reconnect = useCallback(async () => {
    console.log("서버에 재시도 요청...");

    if (!roomId) {
      console.error("재시도 실패: 채팅방 ID가 없습니다.");
      return;
    }

    try {
      // 백엔드 재시도 엔드포인트 호출
      const response = await fetch(`/api/v1/chat/retry/${roomId}`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`재시도 요청 실패: ${response.status}`);
      }

      // 기존 연결 및 타이머 정리
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // 재시도 횟수 초기화
      connectionAttemptsRef.current = 0;

      // UI 상태 리셋
      setLoading(true);

      // 새 SSE 연결 시작
      connectSSE();
    } catch (error) {
      console.error("재시도 요청 오류:", error);
      setError(true, "재시도 요청 중 오류가 발생했습니다.", "network");
    }
  }, [roomId, connectSSE, setError, setLoading]);

  useEffect(() => {
    // 채팅방 ID가 없으면 연결하지 않음
    if (!roomId) return;

    // 이미 연결된 EventSource가 있으면 닫기
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    // 타임아웃 정리
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // 연결 시도 횟수 초기화
    connectionAttemptsRef.current = 0;

    // 초기 연결 시작
    connectSSE();

    // 컴포넌트 언마운트 또는 의존성 변경 시 이벤트 소스 정리
    return () => {
      // 타임아웃 정리
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // 이벤트 소스 정리
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      setIsStreaming(false);
    };
  }, [roomId, connectSSE, setIsStreaming]);

  return { isConnected: !!eventSourceRef.current, reconnect };
};
