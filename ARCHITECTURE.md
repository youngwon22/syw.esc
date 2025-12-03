# SYW.ESC 아키텍처 문서

## 목차
1. [전체 구조 개요](#전체-구조-개요)
2. [레이어별 역할](#레이어별-역할)
3. [가상 파일시스템](#가상-파일시스템)
4. [앱 실행 흐름](#앱-실행-흐름)
5. [데이터 저장/로드](#데이터-저장로드)
6. [새 기능 추가 가이드](#새-기능-추가-가이드)
7. [코딩 컨벤션](#코딩-컨벤션)

---

## 전체 구조 개요

```
┌─────────────────────────────────────────────────────────┐
│                    브라우저 (클라이언트)                    │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐      ┌──────────────┐                 │
│  │   Desktop    │──────│  MenuBar     │                 │
│  │  (최상위)     │      │  (상단바)     │                 │
│  └──────┬───────┘      └──────────────┘                 │
│         │                                                 │
│         ├─── WindowFrame (창 관리)                       │
│         │    ├─── 드래그/리사이즈                        │
│         │    └─── z-index 관리                          │
│         │                                                 │
│         └─── Apps (앱들)                                │
│              ├─── FinderApp                              │
│              ├─── TextEditApp                            │
│              ├─── MusicApp                               │
│              ├─── TerminalApp                            │
│              └─── ... (기타 앱들)                        │
│                                                           │
│  ┌──────────────────────────────────────┐               │
│  │      FileSystem (가상 파일시스템)      │               │
│  │  ┌────────────────────────────────┐ │               │
│  │  │  FileSystemNode (트리 구조)     │ │               │
│  │  │  ├─── /                        │ │               │
│  │  │  │   ├─── Applications/        │ │               │
│  │  │  │   ├─── Documents/            │ │               │
│  │  │  │   ├─── Music/                │ │               │
│  │  │  │   └─── Images/               │ │               │
│  │  └────────────────────────────────┘ │               │
│  └──────────────────────────────────────┘               │
│                                                           │
│  ┌──────────────────────────────────────┐               │
│  │      localStorage (영구 저장)         │               │
│  │  - sywesc_filesystem (JSON)          │               │
│  └──────────────────────────────────────┘               │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### 핵심 원칙

1. **가상 파일시스템 중심**: 모든 앱은 실제 파일시스템이 아닌 가상 파일시스템을 사용
2. **싱글톤 패턴**: FileSystem은 하나의 인스턴스만 존재하며 모든 앱이 공유
3. **자동 저장**: 파일시스템 변경 시 자동으로 localStorage에 저장
4. **트리 구조**: 파일과 폴더는 트리 구조로 관리

---

## 레이어별 역할

### 1. Desktop (`src/components/Desktop.jsx`)

**역할**: 전체 OS 환경의 최상위 컨테이너

**주요 책임**:
- 창 목록 관리 (`windows` state)
- 앱 열기/닫기/포커스 관리
- z-index 관리 (창 겹침 순서)
- 화면 크기 추적
- 앱 컴포넌트 렌더링 라우팅

**핵심 함수**:
```javascript
openApp(appType)      // 앱 열기
closeApp(id)          // 앱 닫기
focusApp(id)          // 앱 포커스
maximizeApp(id)       // 앱 최대화/복원
resizeApp(id, ...)    // 앱 크기 조절
renderApp(appType)    // 앱 타입에 따라 컴포넌트 반환
```

**새 앱 추가 시 수정 필요**:
1. `renderApp()` switch 문에 case 추가
2. `openApp()`에서 창 크기 설정
3. `maximizeApp()`에서 창 크기 설정

---

### 2. FileSystem (`src/core/FileSystem.js`)

**역할**: 가상 OS의 파일시스템 엔진

**주요 클래스**:

#### FileSystemNode
```javascript
{
  name: string,           // 파일/폴더 이름
  type: 'file' | 'folder' | 'app',
  path: string,           // 전체 경로 (/Applications/TextEdit)
  parent: FileSystemNode, // 부모 노드
  children: Map,          // 자식 노드들 (folder만)
  content: string,        // 파일 내용 (file만)
  meta: {
    createdAt: number,
    modifiedAt: number,
    size: number,
    icon: string,
    appType: string,      // type이 'app'일 때
    mimeType: string      // type이 'file'일 때
  }
}
```

#### FileSystem (싱글톤)
```javascript
// 주요 메서드
list(path)                    // 디렉토리 내용 나열
read(path)                    // 파일 읽기
write(path, content, meta)    // 파일 쓰기
createFolder(path, meta)      // 폴더 생성
delete(path)                  // 파일/폴더 삭제
move(oldPath, newPath)         // 이동/이름 변경
open(path)                    // 파일 타입에 따라 적절한 앱 반환
search(rootPath, pattern)      // 파일 검색
getNode(path)                 // 경로로 노드 찾기
```

**자동 저장**:
- `write()`, `createFolder()`, `delete()`, `move()` 호출 시 자동으로 `saveToStorage()` 실행
- localStorage에 `sywesc_filesystem` 키로 JSON 저장

**초기화**:
- 생성자에서 `loadFromStorage()` 호출
- 데이터가 없으면 `initializeDefaultStructure()` 실행

---

### 3. WindowFrame (`src/components/WindowFrame.jsx`)

**역할**: 개별 창의 UI 프레임

**주요 기능**:
- 드래그 앤 드롭
- 리사이즈
- 최소화/최대화/닫기 버튼
- z-index 관리

---

### 4. Apps (`src/apps/`)

**역할**: 각 애플리케이션의 UI와 로직

**공통 패턴**:
- 파일시스템 접근: `import fileSystem from '../core/FileSystem'`
- 파일 열기 이벤트 리스너 (필요한 경우)
- localStorage 직접 접근 금지 (FileSystem API만 사용)

---

## 가상 파일시스템

### 트리 구조

```
/
├── Applications/
│   ├── Album (app)
│   ├── Chats (app)
│   ├── Dino Game (app)
│   ├── Internet (app)
│   ├── Music (app)
│   ├── Photo Booth (app)
│   ├── TextEdit (app)
│   └── Terminal (app)
├── Documents/
│   └── (사용자가 생성한 파일들)
├── Images/
│   └── (이미지 파일들)
└── Music/
    └── default-playlist.json (file)
```

### 경로 규칙

- 절대 경로: `/Applications/TextEdit`
- 상대 경로: `Documents/test.txt` (현재 디렉토리 기준)
- 루트: `/`

### 타입별 동작

#### type: 'app'
- `meta.appType`: 앱 타입 (예: 'Notepad', 'Music')
- `meta.icon`: 아이콘 파일명
- 더블클릭 시 해당 앱 실행

#### type: 'file'
- `content`: 파일 내용 (문자열)
- `meta.mimeType`: MIME 타입 (예: 'text/plain', 'application/json')
- `open()` 호출 시 확장자/MIME 타입에 따라 적절한 앱 반환

#### type: 'folder'
- `children`: Map<string, FileSystemNode>
- `list()` 호출 시 자식 노드들 반환

---

## 앱 실행 흐름

### 시나리오 1: 데스크톱 아이콘 더블클릭

```
1. AppIcon 더블클릭
   ↓
2. onDoubleClick={() => openApp('Notepad')}
   ↓
3. Desktop.openApp('Notepad')
   ├─ 기존 창 확인 (있으면 포커스)
   └─ 없으면 새 창 생성
      {
        id: timestamp,
        appType: 'Notepad',
        title: 'TextEdit',
        x, y, width, height,
        zIndex: nextZIndex
      }
   ↓
4. windows 배열에 추가
   ↓
5. WindowFrame 렌더링
   ↓
6. renderApp('Notepad') → <TextEditApp />
   ↓
7. TextEditApp 마운트 및 초기화
```

### 시나리오 2: Finder에서 앱 실행

```
1. Finder에서 /Applications/TextEdit 더블클릭
   ↓
2. FinderApp.handleItemDoubleClick()
   ↓
3. fileSystem.open('/Applications/TextEdit')
   → { type: 'app', appType: 'Notepad', path: '...' }
   ↓
4. onOpenApp('Notepad')
   ↓
5. Desktop.openApp('Notepad')
   (이후는 시나리오 1과 동일)
```

### 시나리오 3: Finder에서 파일 열기

```
1. Finder에서 /Documents/note.txt 더블클릭
   ↓
2. fileSystem.open('/Documents/note.txt')
   → { type: 'file', appType: 'Notepad', content: '...' }
   ↓
3. onOpenApp('Notepad')
   ↓
4. window.dispatchEvent('openFile', { path, content })
   ↓
5. TextEditApp의 'openFile' 이벤트 리스너
   ↓
6. editorRef.current.innerHTML = content
   ↓
7. setCurrentFilePath(path)
```

---

## 데이터 저장/로드

### 저장 흐름

```
1. 앱에서 fileSystem.write() 호출
   ↓
2. FileSystem.write() 내부:
   - 경로 파싱
   - 부모 노드 찾기
   - 새 노드 생성 또는 기존 노드 업데이트
   - content 저장
   - meta.modifiedAt 업데이트
   ↓
3. this.saveToStorage() 자동 호출
   ↓
4. this.root.toJSON() → 전체 트리 JSON 변환
   ↓
5. localStorage.setItem('sywesc_filesystem', JSON.stringify(data))
   ✅ 완료
```

### 로드 흐름

```
1. 브라우저 페이지 로드
   ↓
2. FileSystem 인스턴스 생성 (싱글톤)
   ↓
3. constructor에서 loadFromStorage() 호출
   ↓
4. localStorage.getItem('sywesc_filesystem')
   ↓
5. JSON.parse() → 객체 변환
   ↓
6. FileSystemNode.fromJSON() → 트리 구조 복원
   ↓
7. initializeDefaultStructure()
   - 데이터 없으면 기본 구조 생성
   - 있으면 기존 데이터 유지
   ↓
8. 모든 앱이 fileSystem 인스턴스 공유
   ✅ 준비 완료
```

### 저장 시점

**자동 저장되는 경우**:
- `fileSystem.write()` 호출 시
- `fileSystem.createFolder()` 호출 시
- `fileSystem.delete()` 호출 시
- `fileSystem.move()` 호출 시

**수동 저장이 필요한 경우**:
- 앱 내부 상태 (예: TextEdit의 편집 중인 내용)
- 앱 설정 (예: Music의 볼륨 설정)
- → 이런 경우는 앱에서 별도로 localStorage 사용 가능

---

## 새 기능 추가 가이드

### 1. 새 앱 추가하기

#### Step 1: 앱 컴포넌트 생성
```javascript
// src/apps/MyNewApp.jsx
import React, { useState } from 'react';
import styles from './MyNewApp.module.css';
import fileSystem from '../core/FileSystem'; // 파일시스템 사용 시

function MyNewApp() {
  // 상태 관리
  const [data, setData] = useState(null);

  // 파일시스템 사용 예시
  useEffect(() => {
    try {
      const file = fileSystem.read('/Documents/config.json');
      setData(JSON.parse(file.content));
    } catch (error) {
      // 파일이 없으면 기본값 사용
      setData({ default: true });
    }
  }, []);

  return (
    <div className={styles.myNewApp}>
      {/* UI */}
    </div>
  );
}

export default MyNewApp;
```

#### Step 2: Desktop.jsx에 등록
```javascript
// src/components/Desktop.jsx

// 1. Import 추가
import MyNewApp from '../apps/MyNewApp';

// 2. renderApp()에 case 추가
const renderApp = (appType) => {
  switch (appType) {
    // ... 기존 cases
    case 'MyNewApp':
      return <MyNewApp />;
    default:
      return <div>Unknown App</div>;
  }
};

// 3. openApp()에서 창 크기 설정
const openApp = (appType) => {
  // ...
  const newWindow = {
    // ...
    width: appType === 'MyNewApp' ? 600 : ...,
    height: appType === 'MyNewApp' ? 400 : ...,
  };
};

// 4. maximizeApp()에서도 창 크기 설정
const maximizeApp = (id) => {
  // ...
  width: window.appType === 'MyNewApp' ? 600 : ...,
  height: window.appType === 'MyNewApp' ? 400 : ...,
};

// 5. title 설정
title: appType === 'MyNewApp' ? 'My New App' : ...,
```

#### Step 3: FileSystem에 앱 등록 (선택사항)
```javascript
// src/core/FileSystem.js
// initializeDefaultStructure() 메서드 내부

const apps = [
  // ... 기존 앱들
  { name: 'My New App', appType: 'MyNewApp', icon: 'myapp.png' }
];
```

#### Step 4: 데스크톱 아이콘 추가 (선택사항)
```javascript
// src/components/Desktop.jsx
<AppIcon
  iconSrc="/icon/myapp.png"
  appName="My New App"
  onDoubleClick={() => openApp('MyNewApp')}
/>
```

---

### 2. 파일시스템 기능 추가하기

#### 새 API 메서드 추가
```javascript
// src/core/FileSystem.js

class FileSystem {
  // ... 기존 메서드들

  /**
   * 새 기능 예시: 파일 복사
   */
  copy(sourcePath, destPath) {
    const sourceNode = this.getNode(sourcePath);
    if (!sourceNode) {
      throw new Error(`Source not found: ${sourcePath}`);
    }

    // 파일 내용 읽기
    const content = sourceNode.type === 'file' 
      ? sourceNode.content 
      : null;

    // 새 경로에 쓰기
    if (sourceNode.type === 'file') {
      this.write(destPath, content, { ...sourceNode.meta });
    } else if (sourceNode.type === 'folder') {
      this.createFolder(destPath, { ...sourceNode.meta });
      // 하위 파일들도 재귀적으로 복사
      this.copyRecursive(sourceNode, destPath);
    }

    // 자동 저장됨 (write/createFolder에서 호출)
  }

  copyRecursive(sourceNode, destPath) {
    if (sourceNode.type === 'folder' && sourceNode.children) {
      sourceNode.children.forEach(child => {
        const childDestPath = `${destPath}/${child.name}`;
        if (child.type === 'file') {
          this.write(childDestPath, child.content, { ...child.meta });
        } else {
          this.createFolder(childDestPath, { ...child.meta });
          this.copyRecursive(child, childDestPath);
        }
      });
    }
  }
}
```

**주의사항**:
- 파일시스템 변경 메서드는 반드시 `this.saveToStorage()` 호출
- 또는 `write()`, `createFolder()`, `delete()`, `move()`를 사용하면 자동 저장됨

---

### 3. 앱에서 파일시스템 사용하기

#### 파일 읽기
```javascript
import fileSystem from '../core/FileSystem';

// 파일 읽기
try {
  const file = fileSystem.read('/Documents/config.json');
  const data = JSON.parse(file.content);
  // 사용
} catch (error) {
  // 파일이 없거나 읽기 실패
  console.error('Failed to read file:', error);
}
```

#### 파일 쓰기
```javascript
// 파일 저장
const content = JSON.stringify({ key: 'value' });
fileSystem.write(
  '/Documents/config.json',
  content,
  { mimeType: 'application/json' }
);
// 자동으로 localStorage에 저장됨
```

#### 디렉토리 나열
```javascript
// 파일 목록 가져오기
const files = fileSystem.list('/Documents');
files.forEach(file => {
  console.log(file.name, file.type, file.path);
});
```

#### 파일 열기 이벤트 리스너 (파일을 앱으로 열 때)
```javascript
useEffect(() => {
  const handleOpenFile = (event) => {
    const { path, content } = event.detail;
    // 파일 내용 로드
    loadFile(content);
    setCurrentFilePath(path);
  };

  window.addEventListener('openFile', handleOpenFile);
  return () => {
    window.removeEventListener('openFile', handleOpenFile);
  };
}, []);
```

---

### 4. 새 명령어 추가 (Terminal)

```javascript
// src/apps/TerminalApp.jsx

const executeCommand = (cmd) => {
  const { command, args } = parseCommand(cmd);

  switch (command.toLowerCase()) {
    // ... 기존 명령어들
    
    case 'mycommand':
      return handleMyCommand(args);
    
    default:
      return `Command not found: ${command}`;
  }
};

const handleMyCommand = (args) => {
  // 명령어 로직
  try {
    // fileSystem API 사용
    const result = fileSystem.list('/');
    return result.map(f => f.name).join('\n');
  } catch (error) {
    return `Error: ${error.message}`;
  }
};
```

---

## 코딩 컨벤션

### 파일 구조
```
src/
├── apps/              # 애플리케이션 컴포넌트
│   ├── MyApp.jsx
│   └── MyApp.module.css
├── components/        # 공통 컴포넌트
│   ├── Desktop.jsx
│   └── WindowFrame.jsx
├── core/              # 핵심 로직
│   └── FileSystem.js
└── hooks/             # 커스텀 훅
    └── useSound.js
```

### 네이밍 규칙
- 컴포넌트: PascalCase (예: `TextEditApp`)
- 파일명: 컴포넌트명과 동일 (예: `TextEditApp.jsx`)
- CSS 모듈: `ComponentName.module.css`
- 함수: camelCase (예: `openApp`, `saveFile`)
- 상수: UPPER_SNAKE_CASE (예: `PLAYLIST_PATH`)

### 파일시스템 사용 규칙
1. **직접 localStorage 접근 금지**: 항상 `fileSystem` API 사용
2. **경로는 항상 절대 경로 사용 권장**: `/Documents/file.txt`
3. **에러 처리**: try-catch로 감싸기
4. **자동 저장 신뢰**: `write()`, `createFolder()` 등은 자동 저장됨

### 상태 관리
- 앱 내부 상태: `useState` 사용
- 전역 상태: 필요시 Context API 또는 이벤트 시스템 사용
- 파일시스템 상태: FileSystem이 관리 (앱에서 직접 접근 불가)

### 이벤트 시스템
```javascript
// 앱 열기
window.dispatchEvent(new CustomEvent('openApp', { 
  detail: 'Notepad' 
}));

// 파일 열기
window.dispatchEvent(new CustomEvent('openFile', { 
  detail: { path: '/Documents/file.txt', content: '...' }
}));
```

---

## 체크리스트: 새 기능 추가 시

### 새 앱 추가
- [ ] `src/apps/MyApp.jsx` 생성
- [ ] `src/apps/MyApp.module.css` 생성
- [ ] `Desktop.jsx`의 `renderApp()`에 case 추가
- [ ] `Desktop.jsx`의 `openApp()`에서 창 크기 설정
- [ ] `Desktop.jsx`의 `maximizeApp()`에서 창 크기 설정
- [ ] `Desktop.jsx`의 title 설정
- [ ] (선택) `FileSystem.js`의 `initializeDefaultStructure()`에 앱 추가
- [ ] (선택) 데스크톱 아이콘 추가

### 파일시스템 기능 추가
- [ ] `FileSystem.js`에 새 메서드 추가
- [ ] 메서드 내부에서 `this.saveToStorage()` 호출 (또는 기존 저장 메서드 사용)
- [ ] 에러 처리 추가
- [ ] 경로 정규화 (`normalizePath` 사용)

### 앱에서 파일시스템 사용
- [ ] `import fileSystem from '../core/FileSystem'` 추가
- [ ] try-catch로 에러 처리
- [ ] 파일 열기 이벤트 리스너 추가 (필요한 경우)

---

## 주의사항

### ❌ 하지 말아야 할 것
1. **localStorage 직접 접근 금지**
   ```javascript
   // ❌ 나쁜 예
   localStorage.setItem('myData', data);
   
   // ✅ 좋은 예
   fileSystem.write('/Documents/myData.json', JSON.stringify(data));
   ```

2. **FileSystem 인스턴스 직접 생성 금지**
   ```javascript
   // ❌ 나쁜 예
   const fs = new FileSystem();
   
   // ✅ 좋은 예
   import fileSystem from '../core/FileSystem';
   ```

3. **앱에서 파일시스템 트리 직접 조작 금지**
   ```javascript
   // ❌ 나쁜 예
   fileSystem.root.children.get('Documents').addChild(node);
   
   // ✅ 좋은 예
   fileSystem.write('/Documents/file.txt', content);
   ```

### ✅ 권장 사항
1. **항상 FileSystem API 사용**: 직접 조작 대신 제공된 API 사용
2. **에러 처리**: 파일시스템 작업은 항상 try-catch로 감싸기
3. **경로 정규화**: 사용자 입력 경로는 `normalizePath()` 사용
4. **자동 저장 신뢰**: `write()`, `createFolder()` 등은 자동 저장됨

---

## 예시: 완전한 새 앱 추가

### 1. 노트 앱 만들기

```javascript
// src/apps/NotesApp.jsx
import React, { useState, useEffect } from 'react';
import styles from './NotesApp.module.css';
import fileSystem from '../core/FileSystem';

function NotesApp() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [content, setContent] = useState('');

  // 노트 목록 로드
  useEffect(() => {
    try {
      const files = fileSystem.list('/Documents/Notes');
      setNotes(files.filter(f => f.type === 'file'));
    } catch (error) {
      // 폴더가 없으면 생성
      try {
        fileSystem.createFolder('/Documents/Notes');
      } catch (e) {
        console.error('Failed to create Notes folder:', e);
      }
    }
  }, []);

  // 노트 저장
  const saveNote = () => {
    if (!selectedNote) {
      const noteName = prompt('노트 이름:');
      if (!noteName) return;
      
      const path = `/Documents/Notes/${noteName}.txt`;
      fileSystem.write(path, content);
      setSelectedNote(path);
    } else {
      fileSystem.write(selectedNote, content);
    }
    
    // 목록 새로고침
    const files = fileSystem.list('/Documents/Notes');
    setNotes(files.filter(f => f.type === 'file'));
  };

  // 노트 열기
  const openNote = (path) => {
    const file = fileSystem.read(path);
    setContent(file.content);
    setSelectedNote(path);
  };

  return (
    <div className={styles.notesApp}>
      <div className={styles.sidebar}>
        <button onClick={saveNote}>💾 저장</button>
        <ul>
          {notes.map(note => (
            <li key={note.path} onClick={() => openNote(note.path)}>
              {note.name}
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.editor}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
    </div>
  );
}

export default NotesApp;
```

### 2. Desktop.jsx에 등록

```javascript
// src/components/Desktop.jsx
import NotesApp from '../apps/NotesApp';

// renderApp()에 추가
case 'Notes':
  return <NotesApp />;

// openApp()에 추가
width: appType === 'Notes' ? 800 : ...,
height: appType === 'Notes' ? 600 : ...,

// title에 추가
title: appType === 'Notes' ? 'Notes' : ...,
```

---

## 업데이트 이력

- 2024-01-XX: 초기 문서 작성
- 가상 파일시스템 구조 완성
- Terminal 앱 추가
- TextEdit, Music 앱 파일시스템 연동

---

## 참고

- FileSystem API: `src/core/FileSystem.js`
- Desktop 컴포넌트: `src/components/Desktop.jsx`
- 예시 앱: `src/apps/TextEditApp.jsx`, `src/apps/MusicApp.jsx`

