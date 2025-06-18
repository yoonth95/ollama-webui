# Ollama WebUI - 로컬 LLM 채팅 웹 인터페이스 🤖

<!-- 메인 이미지 placeholder -->

![Ollama WebUI 메인 화면](./docs/images/main-screenshot.png)

**Ollama WebUI**는 Ollama 기반 로컬 LLM과 직관적으로 상호작용할 수 있는 현대적인 웹 애플리케이션입니다. 완전히 로컬 환경에서 AI 모델을 실행하고 대화할 수 있으며, 풍부한 텍스트 편집 기능과 실시간 스트리밍 응답을 제공합니다.

<br />

## ✨ 주요 기능

### 🎯 핵심 기능

- **실시간 답변**: SSE(Server-Sent Events)를 통한 스트리밍 응답
- **모델 관리**: Ollama 모델 다운로드, 삭제, 목록 조회
- **채팅방 관리**: 채팅방 생성, 삭제, 이름 변경
- **채팅 히스토리**: 대화 내용 자동 저장 및 조회
- **응답 제어**: 채팅 중단, 재시도, 강제 종료

### 🎨 사용자 경험

- **현대적 UI**: React 19 + Tailwind CSS + Shadcn UI 기반 반응형 디자인
- **실시간 피드백**: 모델 다운로드 진행률 및 채팅 상태 표시
- **다크/라이트 모드**: 사용자 환경 설정에 따른 테마 지원
- **접근성**: ARIA 레이블 및 키보드 네비게이션 지원

### 📝 고급 텍스트 편집

- **Tiptap 에디터**: 풍부한 텍스트 편집 기능
- **마크다운 지원**: 실시간 마크다운 렌더링
- **코드 하이라이팅**: 다양한 프로그래밍 언어 지원
- **파일 업로드**: 드래그 앤 드롭 이미지 업로드
- **실시간 미리보기**: 업로드된 이미지 즉시 확인

### ⚙️ 설정 및 관리

- **설정 모달**: 사용자 환경 설정 관리
- **테마 설정**: 사용자 환경 설정에 따른 테마 지원
- **채팅 보관**: 채팅 보관 및 관리
- **채팅 옵션**: 모델별 파라미터 조정 - 추후 예정

### 🛠 기술적 특징

- **타입 안전성**: TypeScript + Zod를 사용하여 타입 안전성 확보
- **현대적 상태 관리**: Zustand + TanStack Query 조합으로 상태 관리
- **커스텀 API 훅**: Axios와 TanStack Query로 API 호출을 간소화하고, 데이터 변환 및 에러 처리를 자동화
- **자동 케이스 변환**: snake_case와 camelCase 간 데이터 변환을 자동 처리해 일관성 유지
- **통합 에러 핸들링**: 커스텀 핸들러로 에러를 일괄 관리
- **성능 최적화**: 코드 분할 및 지연 로딩
- **FSD 아키텍처**: Feature-Sliced Design 구조 적용

<br />

## 🏗 시스템 아키텍처

```
┌─────────────────┐    HTTP/SSE    ┌─────────────────┐    API     ┌─────────────┐
│    Frontend     │◄──────────────►│     Backend     │◄──────────►│    Ollama   │
│     (React)     │                │    (FastAPI)    │            │    Server   │
└─────────────────┘                └─────────────────┘            └─────────────┘
                                            │
                                            ▼
                                 ┌─────────────────────┐
                                 │      SQLite DB      │
                                 │   (모델, 채팅 관리)  │
                                 └─────────────────────┘
```

<br />

## 🚀 빠른 시작

### 사전 요구사항

- **Python 3.8+**
- **Node.js 18+**
- **Ollama** ([설치 가이드](https://ollama.ai/download))

### 설치 및 실행

#### 1. 저장소 클론

```bash
git clone https://github.com/your-username/ollama-webui-cursor.git
cd ollama-webui-cursor
```

#### 2. 백엔드 설정

```bash
cd server
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

#### 3. 프론트엔드 설정

```bash
cd client
npm install
npm run dev
```

#### 4. Ollama 서버 실행

```bash
# 터미널에서 Ollama 서버 시작 또는 ollama 프로그램 실행
ollama serve
```

### 환경 변수 설정

**서버 설정 (server/app/core/config.py):**

```python
# 기본 설정값들이 이미 정의되어 있습니다
API_V1_STR: str = "/api/v1"
PROJECT_NAME: str = "Ollama WebUI"
OLLAMA_API_BASE_URL: str = "http://localhost:11434"
DATABASE_URL: str = "sqlite:///./database.db"
HOST: str = "http://localhost"
PORT: int = 8000
```

**클라이언트 환경 변수:**

```bash
# client/.env.local
VITE_API_BASE_URL=http://localhost:8000
```

</br>

## 📖 사용법

### 1. 첫 실행 및 설정

- **Ollama 서버 확인**: `ollama serve` 명령으로 Ollama가 실행 중인지 확인
- **웹 인터페이스 접속**: 브라우저에서 `http://localhost:3000` 접속

### 2. 모델 관리

- 웹 브라우저에서 모델 선택하여 설치된 모델 사용
- **검색** 기능으로 다운 받고자 하는 모델 검색 (예: exaone3.5, llama3)
- **다운로드** 버튼 클릭하여 원하는 모델 설치
- **다운로드 진행률** 실시간 확인
- **모델 삭제** 기능으로 불필요한 모델 제거

![모델 관리 화면](./docs/images/model-management.gif)

### 3. 채팅 시작하기

- **모델 선택** 드롭다운에서 사용할 모델 선택
- **메시지 입력**:
  - 텍스트 입력 후 Enter 또는 전송 버튼 클릭
  - 이미지 파일 드래그 앤 드롭으로 업로드
  - 마크다운 문법 사용 가능
- **실시간 응답** 확인 및 상호작용

![채팅 데모](./docs/images/chat-demo.gif)

### 4. 고급 기능 활용

- **채팅 중단**: 응답 생성 중 언제든 중단 가능
- **답변 재시도**: 만족스럽지 않은 답변 재생성
- **채팅 히스토리**: 이전 대화 내용 검색 및 조회
- **채팅방 관리**: 채팅방 이름 변경, 삭제, 즐겨찾기

<br />

## 🛠 개발 가이드

### 프로젝트 구조

```
ollama-webui-cursor/
├── client/                 # React 프론트엔드 (FSD 아키텍처)
│   ├── src/
│   │   ├── app/            # 애플리케이션 레이어 (라우팅, 전역 설정)
│   │   ├── features/       # 기능별 비즈니스 로직
│   │   │   ├── chat/       # 채팅 기능
│   │   │   ├── chatEditor/ # 텍스트 에디터 (Tiptap)
│   │   │   ├── dropzone/   # 파일 업로드
│   │   │   ├── home/       # 홈 페이지
│   │   │   └── markdown/   # 마크다운 렌더링
│   │   ├── widgets/        # 복합 UI 컴포넌트
│   │   │   ├── layout/     # 레이아웃 컴포넌트
│   │   │   └── settings-modal/ # 설정 모달
│   │   ├── shared/         # 공유 리소스
│   │   │   ├── api/        # API 클라이언트
│   │   │   ├── components/ # 공용 컴포넌트
│   │   │   ├── hooks/      # 커스텀 훅
│   │   │   ├── stores/     # 상태 관리 (Zustand)
│   │   │   ├── types/      # 타입 정의
│   │   │   ├── ui/         # UI 컴포넌트 (Shadcn UI)
│   │   │   └── utils/      # 유틸리티 함수
│   │   └── types/          # 전역 타입 정의
│   └── package.json
├── server/                 # FastAPI 백엔드
│   ├── app/
│   │   ├── api/            # API 엔드포인트
│   │   │   └── endpoints/  # 라우터 (model, chat, room)
│   │   ├── core/           # 핵심 설정 (config.py)
│   │   ├── db/             # 데이터베이스 모델
│   │   ├── schemas/        # Pydantic 스키마
│   │   ├── services/       # 비즈니스 로직
│   │   └── utils/          # 유틸리티 함수
│   └── requirements.txt
└── README.md
```

### API 문서

서버 실행 후 다음 URL에서 자동 생성된 API 문서를 확인할 수 있습니다:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### 기술 스택

**프론트엔드:**

- React 19 + TypeScript
- Vite (빌드 도구)
- Tailwind CSS + Shadcn/ui (UI 컴포넌트)
- Zod (타입 검증)
- TanStack Query (서버 상태 관리)
- Zustand (클라이언트 상태 관리)
- React Router (라우팅)
- Tiptap (텍스트 에디터)

**백엔드:**

- FastAPI (Python 웹 프레임워크)
- SQLAlchemy (ORM)
- Pydantic (데이터 검증)
- SSE-Starlette (실시간 통신)
- Ollama Python Client
