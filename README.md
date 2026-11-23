# WebFrameWork

한성대학교 웹프레임워크 팀 프로젝트: **모이자**

비로그인 사용자는 모임 탐색 랜딩 화면을 먼저 이용하고, 오른쪽 위 로그인 버튼에서 로그인할 수 있습니다. 로그인 후에는 같은 위치에 프로필 아이콘이 나타나며, 기존 지도 기반 모임 기능을 사용할 수 있습니다.

## 기술 스택

- Frontend: JavaScript, React 19, Vite 8
- UI 아이콘: [React Icons](https://react-icons.github.io/react-icons/) (`react-icons`, Feather 아이콘 세트)
- Backend: Java, Spring Boot, Gradle

## 프론트엔드 실행

Node.js 22.13 이상인 22.x 또는 Node.js 24 이상과 npm이 필요합니다.

```bash
cd FrontEnd
npm ci
npm run dev
```

프론트엔드 개발 서버는 `http://localhost:5174`에서 실행됩니다. `npm ci`가 `package-lock.json`에 기록된 `react-icons`도 포함해 필요한 라이브러리를 설치합니다. 별도 설치가 필요할 경우:

```bash
npm install react-icons
```

프로젝트 코드에서 아이콘을 추가할 때는 필요한 아이콘만 가져옵니다.

```jsx
import { FiHeart, FiUser } from 'react-icons/fi';
```

## 백엔드 실행

```bash
cd BackEnd
./gradlew bootRun
```

데이터베이스 및 외부 API 설정은 `BackEnd/src/main/resources/application.yaml`을 확인하세요.

## 주요 명령어

| 위치 | 명령어 | 설명 |
| --- | --- | --- |
| `FrontEnd` | `npm run dev` | Vite 개발 서버 실행 |
| `FrontEnd` | `npm run build` | 배포용 `dist/` 생성 |
| `FrontEnd` | `npm run lint` | ESLint 코드 검사 |
| `BackEnd` | `./gradlew bootRun` | Spring Boot 서버 실행 |
