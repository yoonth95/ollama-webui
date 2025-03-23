import { DigestWithProgressType } from "@/widgets/layout/header/stores/useModelDownloadStore";

interface DownloadModelPropsType {
  modelName: string;
  updateProgress: (progress: DigestWithProgressType) => void;
  controller: AbortController;
}
const downloadModel = async ({ modelName, updateProgress, controller }: DownloadModelPropsType) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/model/download?model_name=${modelName}`, {
      signal: controller.signal,
    });

    if (!response.ok) {
      return { ok: false, message: "서버 응답이 올바르지 않습니다." };
    }

    const reader = response.body?.getReader();
    if (!reader) {
      return { ok: false, message: "서버 응답이 올바르지 않습니다." };
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.trim()) continue;

        try {
          const { ok, message, data } = JSON.parse(line);

          // 메시지를 직접 사용하여 리턴하도록 개선
          if (!ok) {
            return { ok: false, message };
          }

          if (!data) continue;

          const { model_name, digest, progress, status } = data;

          // 이미 설치된 모델 처리
          if (status === "already_installed") {
            return { ok: false, message, detail: "aleady" };
          }

          if (progress !== undefined) {
            updateProgress({ model_name, digest: digest || "", progress });
          }

          if (status === "cancelled") {
            return { ok: true, message, detail: "cancel" };
          }

          if (status === "success") {
            return { ok: true, message };
          }
        } catch (error) {
          console.error("JSON 파싱 오류:", error, "원본 데이터:", line);
          return { ok: false, message: "JSON 파싱 오류" };
        }
      }
    }

    return { ok: false, message: "다운로드가 예상치 못한 상태로 종료되었습니다." };
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return { ok: true, message: "다운로드 요청이 취소되었습니다.", detail: "cancel" };
      }
      console.error("다운로드 오류:", error.message);
      return { ok: false, message: `알 수 없는 오류가 발생했습니다: ${error.message}` };
    }

    console.error("다운로드 오류: 알 수 없는 예외", error);
    return { ok: false, message: "알 수 없는 오류가 발생했습니다." };
  }
};

export default downloadModel;
