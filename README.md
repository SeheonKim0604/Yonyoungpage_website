# 연영회 홈페이지

사진 동아리 연영회 공식 홈페이지입니다.

## 기술 스택

- Next.js 14+ (App Router)
- TypeScript
- CSS Modules

## 시작하기

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 프로젝트 구조

- `src/app/` - 페이지 및 라우팅
  - `page.tsx` - 홈페이지
  - `about/` - ABOUT 페이지
  - `works/` - WORKS 페이지 (갤러리)
  - `exhibitions/` - EXHIBITIONS 페이지
  - `recruiting/` - RECRUITING 페이지
  - `donate/` - DONATE US 페이지
- `src/components/` - 재사용 가능한 컴포넌트
  - `Navigation.tsx` - 네비게이션 바
  - `Hero.tsx` - 히어로 섹션 (배너)
  - `Gallery.tsx` - 갤러리 메인 컴포넌트
  - `ImageGrid.tsx` - 그리드 뷰
  - `ImageGallery.tsx` - 갤러리 뷰 (라이트박스)
- `src/config/` - 설정 파일
  - `banner.json` - 배너 이미지 리스트
  - `activities.json` - 활동 기록 데이터
  - `exhibitions.json` - 전시회 데이터
  - `photographers.json` - 사진가 데이터
  - `linktree.json` - 링크트리 데이터
  - `about.json` - 동아리 소개 데이터
- `public/images/` - 이미지 파일
  - `banner/` - 배너 이미지
  - `gallery/` - 갤러리 이미지
  - `works/` - 작품 이미지
  - `exhibitions/` - 전시회 이미지

## 데이터 수정 방법

1. **자동 수정**: 웹사이트의 관리자 모드(로그인 시 나타나는 '+' 버튼이나 수정 아이콘)를 통해 데이터를 업로드하거나 수정하면 `src/config/` 내의 해당 JSON 파일들이 자동으로 업데이트됩니다.
2. **수동 수정**: `src/config/` 하위의 각 JSON 파일을 열어 직접 데이터를 추가하거나 수정할 수 있습니다. 수정한 내용은 새로고침 시 즉각 반영됩니다.

자세한 내용은 `수정가이드.md`를 참고하세요.

## 디자인 시스템

- **주 색상**: #2C3357
- **배경 색상**: #EFF0F0
- **보조 색상**: #BFBFBF

## 주요 기능

- 반응형 디자인 (모바일/태블릿/데스크톱)
- 이미지 갤러리 (그리드 뷰 / 갤러리 뷰 전환)
- 라이트박스 이미지 뷰어
- 배너 이미지 슬라이더
- 미니멀한 디자인
