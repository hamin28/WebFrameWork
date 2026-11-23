# BackEnd

Spring Boot 기반 모임 서비스 백엔드입니다. Java 17과 MySQL을 사용합니다.

## 실행

MySQL에 사용할 데이터베이스를 준비하고, 아래 환경변수를 실제 접속 정보로 설정합니다.

- `DB_URL`: MySQL JDBC 접속 주소 (예: `jdbc:mysql://localhost:3306/myproject`)
- `DB_USERNAME`: DB 사용자명
- `DB_PASSWORD`: DB 비밀번호

IDE의 실행 환경변수 또는 터미널 환경변수로 지정하세요. `.env` 파일을 만드는 것만으로 Spring Boot가 자동으로 읽지는 않습니다.

```bash
cd BackEnd
./gradlew bootRun
```

Windows에서는 `gradlew.bat bootRun`을 사용합니다. 기본 서버 포트는 8080입니다.

DB 접속 정보, 빌드 결과, 로컬 캐시 및 기존 Git 기록은 포함하지 않았습니다.
