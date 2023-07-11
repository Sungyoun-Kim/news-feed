# news-feed

학교 관리자는 학교 페이지를 만들어 운영하고 소식을 발행, 관리합니다<br>
학생은 학교 페이지를 구독, 취소하고 상세보기를 할 수 있고 자신의 뉴스피드에서 모아봅니다

## 구동 방법

1. 해당 레포지토리를 클론(git clone https://github.com/Sungyoun-Kim/news-feed.git)
2. aws configure를 진행 (액세스 키, 시크릿 액세스키 제공)
3. npm install
4. .env 파일을 생성합니다 (환경 변수 제공)
5. npm test는 e2e테스트 코드 실행
6. npm run start 는 서버 실행
7. swagger로 만든 API 문서의 주소는 http://localhost:3000/api-docs# 입니다

## 지역 명

지역은 도 단위를 DynamoDB에 저장해 두었으며 아래와 같음(다르면 학교 페이지 생성 불가)<br>

강원특별자치도<br>
충청남도<br>
대전광역시<br>
세종특별자치시<br>
충청북도<br>
경기도<br>
대구광역시<br>
서울특별시<br>

등 17개가 존재함

## 미리 생성해 둔 계정

### 관리자

admin@email.com/1234

### 학생

student@email.com/1234
