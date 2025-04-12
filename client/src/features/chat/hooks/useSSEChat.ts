import { useState, useEffect, useRef } from "react";

type SSEDataType = {
  isReceiving: boolean;
  response: string;
  model?: string;
  createdAt?: string;
  error?: boolean;
  errorType?: string;
  errorMessage?: string;
};

/**
 * 채팅방 SSE 연결을 관리하는 훅
 * @param chatRoomId 채팅방 ID
 * @returns SSE 응답 데이터와 상태
 */
export const useSSEChat = (chatRoomId: string, isOptimistic: boolean) => {
  const [sseData, setSseData] = useState<SSEDataType>({
    isReceiving: false,
    response: "",
  });
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // 채팅방 ID가 없는 경우 연결하지 않음
    if (!chatRoomId || !isOptimistic) {
      return;
    }

    setSseData({ isReceiving: true, response: "" });

    // SSE 연결 생성
    const eventSource = new EventSource(`/api/v1/chat/stream/${chatRoomId}`);
    eventSourceRef.current = eventSource;

    // 연결 성공 이벤트
    eventSource.addEventListener("connected", (event) => {
      console.log("SSE 연결 성공:", event.data);
    });

    // 메시지 이벤트
    eventSource.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data);

        // 초기 메시지인 경우 (이미 저장된 답변)
        if (data.init) {
          setSseData({
            isReceiving: true,
            response: data.full,
            model: data.model,
            createdAt: data.created_at,
          });
          return;
        }

        // 메시지가 계속 추가되는 경우
        if (data.delta) {
          setSseData({
            isReceiving: true,
            response: data.full,
            model: data.model,
            createdAt: data.created_at,
          });
        }

        // 완료 메시지
        if (data.done) {
          setSseData({
            isReceiving: false,
            response: data.full,
            model: data.model,
            createdAt: data.created_at,
          });

          // 완료 시 연결 종료
          eventSource.close();
        }
      } catch (error) {
        console.error("SSE 메시지 파싱 오류:", error);
      }
    });

    // 오류 이벤트
    eventSource.addEventListener("error", (event) => {
      try {
        // 오류 데이터 파싱 시도
        const errorData = JSON.parse((event as MessageEvent).data || "{}");

        // 오류 상태 설정
        setSseData({
          isReceiving: false,
          response: "",
          error: true,
          errorType: errorData.error_type || "unknown",
          errorMessage: errorData.message || "알 수 없는 오류가 발생했습니다",
        });

        // 오류 콘솔 출력
        console.error("SSE 오류:", errorData.message || "메시지를 받는 중 오류가 발생했습니다");
      } catch {
        // 기본 오류 처리
        setSseData({
          isReceiving: false,
          response: "",
          error: true,
          errorType: "connection",
          errorMessage: "연결 중 오류가 발생했습니다",
        });

        console.error("서버 연결 중 오류가 발생했습니다");
      }
    });

    // 타임아웃 이벤트
    eventSource.addEventListener("timeout", () => {
      setSseData({
        isReceiving: false,
        response: "",
        error: true,
        errorType: "timeout",
        errorMessage: "연결 시간이 초과되었습니다",
      });

      console.warn("연결 시간이 초과되었습니다");
      eventSource.close();
    });

    // 비활성 이벤트
    eventSource.addEventListener("inactive", () => {
      setSseData({
        isReceiving: false,
        response: "",
      });

      console.info("장시간 활동이 없어 연결이 종료되었습니다");
      eventSource.close();
    });

    // 핑-퐁 이벤트 (서버 연결 유지용)
    eventSource.addEventListener("ping", () => {
      // 핑 이벤트 수신 시 특별한 처리 없음 (서버 연결 유지 목적)
    });

    // 컴포넌트 언마운트 또는 의존성 변경 시 연결 종료
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [chatRoomId, isOptimistic]);

  return { sseData };
};
