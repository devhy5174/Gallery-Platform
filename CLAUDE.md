# Gallery Platform — 프로젝트 가이드

## 프로젝트 개요

누구나 자신만의 3D 온라인 전시회를 만들 수 있는 셀프서비스 플랫폼.
사진 최대 12장을 업로드하면 3D 갤러리에 자동 배치된다.
나중에 결제(10만원)·회원가입·Supabase·고객별 URL 등을 붙일 예정.

원본 소스: `/Users/heeyeoun/Desktop/projects/soon-gallery` (건드리지 말 것)

---

## 기술 스택

- React 19 + TypeScript + Vite
- Three.js + React Three Fiber + Drei
- 순수 CSS (CSS 변수 기반 디자인 시스템, `src/index.css`)
- Supabase 연동 예정 (현재 미구현)

---

## 화면 흐름

```
SetupScreen → Gallery → MediaRoom
   (setup)    (gallery)  (media-room)
```

App.tsx의 `screen` state가 전환을 관리한다.

---

## 파일 구조

```
src/
├── App.tsx                    # 루트 — 화면 전환 + 전시 데이터 보유
├── types/index.ts             # AppScreen, ArtworkItem, ExhibitionData
├── utils/slotMapper.ts        # 업로드 순서 → 12슬롯 ID 매핑 + Viewpoint 타입 + generateViewpoints()
│
├── components/
│   ├── setup/
│   │   └── SetupScreen.tsx    # 전시 제목/소개 입력 + 사진 업로드 + 작품 편집
│   │
│   ├── gallery/               # 3D 갤러리 (soon-gallery에서 이식·수정)
│   │   ├── Gallery.tsx        # 갤러리 메인 — artworks·exhibitionTitle props 받음
│   │   ├── GalleryArtworks.tsx# 슬롯 위치 정의 + 액자 렌더링 + BackWallSign(전시 제목)
│   │   ├── GalleryControls.tsx# PC 1인칭 조작 (WASD + 뷰포인트 애니메이션)
│   │   ├── GalleryControlsMobile.tsx # 모바일 (바닥탭·드래그·D패드·뷰포인트 애니메이션)
│   │   ├── GalleryHUD.tsx     # 오버레이 UI (PC/모바일 공통, D패드 컴포넌트 포함)
│   │   ├── dpadStore.ts       # D패드 방향키 상태 (모듈 레벨 공유 store)
│   │   ├── artworkData.ts     # ArtworkData 인터페이스만 (하드코딩 데이터 없음)
│   │   ├── constants.ts       # ROOM, COLORS, CAMERA_INITIAL, MOVE_BOUNDS, DOOR_ZONE
│   │   └── ...                # GalleryRoom, GalleryLights, ArtworkModal, VaseDecor 등
│   │
│   └── mediaroom/             # 미디어 룸 (슬라이드쇼 자동 감상)
│       ├── MediaRoom.tsx      # artworks prop 받아서 슬라이드쇼
│       └── MediaRoomScene.tsx # 3D 씬 + 슬라이드쇼 로직
```

---

## 핵심 데이터 흐름

```
사용자 업로드 (File)
  → URL.createObjectURL(file) = blob URL
  → ArtworkItem[] (types/index.ts)
  → assignSlots() (slotMapper.ts)
  → ArtworkData[] (슬롯 ID: "left-7", "right-1" 등)
  → Gallery / MediaRoom에 props로 주입
```

### 슬롯 배치 순서 (시각적 중요도 순)

| 순서 | 슬롯 ID | 위치 |
|------|---------|------|
| 1 | back-main | 뒷벽 메인 (대형, 2×2.6m) |
| 2 | left-7 | 왼쪽 가운데 |
| 3 | right-7 | 오른쪽 가운데 |
| 4 | front-2 | 앞벽 중앙 |
| 5~8 | left-1, right-1, left-n5, right-n5 | 좌우벽 |
| 9~10 | front-1, front-3 | 앞벽 좌우 |
| 11~12 | back-left-1, back-right-1 | 뒷벽 사이드 |

### 뷰포인트 (모바일/PC 투어)

`generateViewpoints(artworks)` → 배치된 슬롯 기준 동적 생성 (slotMapper.ts)
투어 순서: 왼쪽벽 → 앞벽 → 오른쪽벽 → 뒷벽

---

## 모바일 조작 (GalleryControlsMobile)

- **바닥 탭**: 해당 위치로 자동 이동
- **드래그**: 시점 회전 (자연스러운 터치 방향, `euler += dx`)
- **D패드**: 꾹 눌러 연속 이동 (dpadStore 경유)
- **작품 탭**: ArtworkModal 오픈
- **투어 모드 (artworkIdx >= 0)**: 드래그·바닥탭·D패드 전부 잠금

### 잠금 조건

| 상태 | 드래그 | 바닥탭 | D패드 |
|------|--------|--------|-------|
| 자유 이동 | ✅ | ✅ | ✅ |
| 투어 중 (artworkIdx >= 0) | ❌ | ❌ | ❌ |
| 모달 열림 | ❌ | ❌ | ❌ |

---

## PC 조작 (GalleryControls)

- **WASD / 방향키**: 이동
- **마우스**: 시점 (PointerLockControls)
- **투어 모드**: PointerLockControls 비활성, 카메라 뷰포인트 애니메이션 (ease-out cubic)
- **클릭 유도 오버레이**: "작품 감상하기" 버튼 포함

---

## CSS 디자인 시스템 (`src/index.css`)

```css
--bg: #f7f3eb        /* 아이보리 배경 */
--surface: #fffcf7
--text-h: #292724
--primary: #76563e   /* 갈색 */
--accent: #a64b3c    /* 붉은 인장색 */
--border: #ddd0bd
--sans: Pretendard / Noto Sans KR
--heading: Noto Serif KR / Nanum Myeongjo
```

---

## 아직 구현 안 된 것 (다음 단계)

- [ ] Supabase 연동 (전시 데이터 저장·불러오기)
- [ ] 회원가입 / 결제 (10만원)
- [ ] 고객별 고유 URL 생성 (`/gallery/[id]`)
- [ ] 테마 선택 (문인화 / 유치원·학교 / 픽셀 등)
- [ ] 전시 제목·소개 수정 (SetupScreen으로 돌아가기)
- [ ] 사진 aspect ratio 맞는 액자 크기 (현재 고정 1.1×1.4)
- [ ] 작품 순서를 슬롯 위치와 연동 (현재 중요도 순 고정)
- [ ] 모바일 SetupScreen UX 개선 (드래그 순서 변경 등)

---

## 개발 원칙

- 기존 soon-gallery 코드를 최대한 재사용한다
- 불필요한 외부 라이브러리 추가 금지
- Blob URL은 세션 한정 (새로고침 시 소멸) — Supabase 연동 전까지 허용
- 새 기능 추가 시 soon-gallery와의 동기화 여부를 항상 확인한다
- 요청한 기능만 구현하고 범위를 임의로 확장하지 않는다
