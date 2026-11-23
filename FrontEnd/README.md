# highLevelMobileSW

React frontend project

## 프론트엔드

**모이자** 서비스의 React 기반 프론트엔드입니다. 비로그인 사용자는 모임을 둘러볼 수 있는 웹 랜딩 화면을 먼저 보고, 상단 로그인 버튼으로 로그인·회원가입 화면에 이동합니다. 로그인하면 같은 위치에 프로필 아이콘이 표시됩니다.

### 기술 스택

| 구분             | 사용 기술                                                                                             |
| ---------------- | ----------------------------------------------------------------------------------------------------- |
| UI               | React 19, React DOM 19                                                                                |
| 언어 / 스타일    | JavaScript (JSX), CSS                                                                                 |
| 개발 서버 / 빌드 | Vite 8, @vitejs/plugin-react                                                                          |
| 코드 검사        | ESLint 10, React Hooks / React Refresh 플러그인                                                       |
| 상태 관리 / 통신 | React Hooks, Fetch API                                                                                |
| 아이콘           | [React Icons](https://react-icons.github.io/react-icons/) (`react-icons` 패키지, Feather 아이콘 세트) |

### 로컬 실행

Node.js 22.13 이상인 22.x 또는 Node.js 24 이상과 npm이 필요합니다.

```bash
git clone https://github.com/Gomoph/highLevelMobileSW-Frontend.git
cd highLevelMobileSW-Frontend
npm ci
npm run dev
```

별도로 설치할 라이브러리: `react-icons`입니다. 현재 `package.json`과 `package-lock.json`에 포함되어 있어 `npm ci`를 실행하면 React Icons도 함께 설치됩니다. 처음부터 설치하는 경우에는 다음 명령으로 설치할 수 있습니다.

```bash
npm install react-icons
```

아이콘은 `react-icons/fi`에서 필요한 컴포넌트만 가져옵니다. 예: `import { FiHeart, FiUser } from 'react-icons/fi';`

터미널에 표시되는 개발 서버 주소로 접속합니다. 프론트엔드는 `http://localhost:5174`에서 실행됩니다.

| 명령어            | 설명                                                    |
| ----------------- | ------------------------------------------------------- |
| `npm run dev`     | 개발 서버 실행                                          |
| `npm run build`   | 배포용 파일을 `dist/`에 생성                            |
| `npm run preview` | 빌드 결과를 로컬에서 미리보기 (`npm run build` 후 실행) |
| `npm run lint`    | ESLint 코드 검사                                        |

### 폴더 구조
