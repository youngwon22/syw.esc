/**
 * 가상 파일시스템 모델
 * 트리 구조로 파일과 폴더를 관리
 */

class FileSystemNode {
  constructor(name, type, path, parent = null) {
    this.name = name;
    this.type = type; // 'file', 'folder', 'app'
    this.path = path;
    this.parent = parent;
    this.children = type === 'folder' ? new Map() : null;
    this.content = type === 'file' ? '' : null;
    this.meta = {
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      size: 0,
      icon: null,
      appType: null, // type이 'app'일 때 사용
      mimeType: null // type이 'file'일 때 사용
    };
  }

  addChild(node) {
    if (this.type !== 'folder') {
      throw new Error('Only folders can have children');
    }
    this.children.set(node.name, node);
    this.meta.modifiedAt = Date.now();
  }

  removeChild(name) {
    if (this.type !== 'folder') {
      throw new Error('Only folders can have children');
    }
    this.children.delete(name);
    this.meta.modifiedAt = Date.now();
  }

  getChild(name) {
    if (this.type !== 'folder') {
      return null;
    }
    return this.children.get(name);
  }

  toJSON() {
    const json = {
      name: this.name,
      type: this.type,
      path: this.path,
      meta: this.meta
    };

    if (this.type === 'folder' && this.children) {
      json.children = Array.from(this.children.values()).map(child => child.toJSON());
    } else if (this.type === 'file') {
      json.content = this.content;
    }

    return json;
  }

  static fromJSON(json, parent = null) {
    const node = new FileSystemNode(json.name, json.type, json.path, parent);
    node.meta = { ...json.meta };
    
    if (json.type === 'file') {
      node.content = json.content || '';
    } else if (json.type === 'folder' && json.children) {
      json.children.forEach(childJson => {
        const child = FileSystemNode.fromJSON(childJson, node);
        node.addChild(child);
      });
    }

    return node;
  }
}

class FileSystem {
  constructor() {
    this.root = new FileSystemNode('', 'folder', '/', null);
    this.loadFromStorage();
    this.initializeDefaultStructure();
  }

  /**
   * 경로를 배열로 분리
   */
  parsePath(path) {
    return path.split('/').filter(part => part !== '');
  }

  /**
   * 경로로 노드 찾기
   */
  getNode(path) {
    if (path === '/') {
      return this.root;
    }

    const parts = this.parsePath(path);
    let current = this.root;

    for (const part of parts) {
      if (!current || current.type !== 'folder') {
        return null;
      }
      current = current.getChild(part);
      if (!current) {
        return null;
      }
    }

    return current;
  }

  /**
   * 경로의 부모 노드 찾기
   */
  getParentNode(path) {
    const parts = this.parsePath(path);
    if (parts.length === 0) {
      return this.root;
    }
    const parentPath = '/' + parts.slice(0, -1).join('/');
    return this.getNode(parentPath || '/');
  }

  /**
   * 경로의 마지막 이름 추출
   */
  getBasename(path) {
    const parts = this.parsePath(path);
    return parts[parts.length - 1] || '';
  }

  /**
   * 디렉토리 내용 나열
   */
  list(path = '/') {
    const node = this.getNode(path);
    if (!node) {
      throw new Error(`Path not found: ${path}`);
    }
    if (node.type !== 'folder') {
      throw new Error(`Not a directory: ${path}`);
    }

    return Array.from(node.children.values()).map(child => ({
      name: child.name,
      type: child.type,
      path: child.path,
      meta: { ...child.meta }
    }));
  }

  /**
   * 파일 읽기
   */
  read(path) {
    const node = this.getNode(path);
    if (!node) {
      throw new Error(`File not found: ${path}`);
    }
    if (node.type !== 'file') {
      throw new Error(`Not a file: ${path}`);
    }

    return {
      content: node.content,
      meta: { ...node.meta }
    };
  }

  /**
   * 파일 쓰기
   */
  write(path, content, meta = {}) {
    const parent = this.getParentNode(path);
    if (!parent) {
      throw new Error(`Parent directory not found: ${path}`);
    }

    const name = this.getBasename(path);
    let node = parent.getChild(name);

    if (node) {
      // 기존 파일 업데이트
      if (node.type !== 'file') {
        throw new Error(`Path exists but is not a file: ${path}`);
      }
      node.content = content;
      node.meta = { ...node.meta, ...meta, modifiedAt: Date.now() };
      node.meta.size = content.length;
    } else {
      // 새 파일 생성
      node = new FileSystemNode(name, 'file', path, parent);
      node.content = content;
      node.meta = { ...node.meta, ...meta };
      node.meta.size = content.length;
      parent.addChild(node);
    }

    this.saveToStorage();
    return node;
  }

  /**
   * 폴더 생성
   */
  createFolder(path, meta = {}) {
    const parent = this.getParentNode(path);
    if (!parent) {
      throw new Error(`Parent directory not found: ${path}`);
    }

    const name = this.getBasename(path);
    if (parent.getChild(name)) {
      throw new Error(`Path already exists: ${path}`);
    }

    const node = new FileSystemNode(name, 'folder', path, parent);
    node.meta = { ...node.meta, ...meta };
    parent.addChild(node);

    this.saveToStorage();
    return node;
  }

  /**
   * 파일/폴더 삭제
   */
  delete(path) {
    const node = this.getNode(path);
    if (!node) {
      throw new Error(`Path not found: ${path}`);
    }
    if (path === '/') {
      throw new Error('Cannot delete root directory');
    }

    const parent = node.parent;
    parent.removeChild(node.name);

    this.saveToStorage();
  }

  /**
   * 파일/폴더 이동 또는 이름 변경
   */
  move(oldPath, newPath) {
    const node = this.getNode(oldPath);
    if (!node) {
      throw new Error(`Source not found: ${oldPath}`);
    }

    const newParent = this.getParentNode(newPath);
    if (!newParent) {
      throw new Error(`Destination directory not found: ${newPath}`);
    }

    const newName = this.getBasename(newPath);
    if (newParent.getChild(newName)) {
      throw new Error(`Destination already exists: ${newPath}`);
    }

    // 기존 위치에서 제거
    node.parent.removeChild(node.name);

    // 새 위치에 추가
    node.name = newName;
    node.path = newPath;
    node.parent = newParent;
    newParent.addChild(node);

    // 하위 노드들의 경로도 업데이트
    this.updateChildrenPaths(node);

    this.saveToStorage();
    return node;
  }

  /**
   * 하위 노드들의 경로 업데이트 (move 시 사용)
   */
  updateChildrenPaths(node) {
    if (node.type === 'folder' && node.children) {
      node.children.forEach(child => {
        child.path = node.path === '/' 
          ? `/${child.name}` 
          : `${node.path}/${child.name}`;
        child.parent = node;
        this.updateChildrenPaths(child);
      });
    }
  }

  /**
   * 파일 열기 (타입에 따라 적절한 앱 반환)
   */
  open(path) {
    const node = this.getNode(path);
    if (!node) {
      throw new Error(`Path not found: ${path}`);
    }

    if (node.type === 'app') {
      return {
        type: 'app',
        appType: node.meta.appType,
        path: node.path
      };
    }

    if (node.type === 'file') {
      // 확장자에 따라 앱 타입 결정
      const ext = node.name.split('.').pop()?.toLowerCase();
      const mimeType = node.meta.mimeType;

      if (mimeType?.startsWith('text/') || ext === 'txt' || ext === 'md') {
        return {
          type: 'file',
          appType: 'Notepad',
          path: node.path,
          content: node.content
        };
      }

      if (mimeType?.startsWith('audio/') || ext === 'mp3' || ext === 'wav') {
        return {
          type: 'file',
          appType: 'Music',
          path: node.path,
          content: node.content
        };
      }

      // 기본값: TextEdit
      return {
        type: 'file',
        appType: 'Notepad',
        path: node.path,
        content: node.content
      };
    }

    if (node.type === 'folder') {
      return {
        type: 'folder',
        path: node.path
      };
    }

    return null;
  }

  /**
   * localStorage에 저장
   */
  saveToStorage() {
    try {
      const data = this.root.toJSON();
      localStorage.setItem('sywesc_filesystem', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save filesystem to localStorage:', error);
    }
  }

  /**
   * localStorage에서 로드
   */
  loadFromStorage() {
    try {
      const data = localStorage.getItem('sywesc_filesystem');
      if (data) {
        const json = JSON.parse(data);
        this.root = FileSystemNode.fromJSON(json, null);
        return true;
      }
    } catch (error) {
      console.error('Failed to load filesystem from localStorage:', error);
    }
    return false;
  }

  /**
   * 기본 파일시스템 구조 초기화
   */
  initializeDefaultStructure() {
    // Applications 폴더 확인 및 생성
    let applications = this.getNode('/Applications');
    if (!applications) {
      applications = new FileSystemNode('Applications', 'folder', '/Applications', this.root);
      applications.meta.icon = '파인더.png';
      this.root.addChild(applications);
    }

    // 기본 앱 목록
    const defaultApps = [
      { name: 'Album', appType: 'Album', icon: '앨범 앱.png' },
      { name: 'Chats', appType: 'Chats', icon: '맥 chat.png' },
      { name: 'Dino Game', appType: 'DinoGame', icon: '공룡게임.svg' },
      { name: 'Internet', appType: 'Internet', icon: 'internet.png' },
      { name: 'Music', appType: 'Music', icon: '음악 앱.png' },
      { name: 'Photo Booth', appType: 'PhotoBooth', icon: '포토부스.png' },
      { name: 'TextEdit', appType: 'Notepad', icon: 'text.png' },
      { name: 'Terminal', appType: 'Terminal', icon: 'terminal.png' }
    ];

    // 앱이 없으면 추가
    defaultApps.forEach(app => {
      const appPath = `/Applications/${app.name}`;
      const existingApp = this.getNode(appPath);
      if (!existingApp) {
        const appNode = new FileSystemNode(app.name, 'app', appPath, applications);
        appNode.meta.appType = app.appType;
        appNode.meta.icon = app.icon;
        applications.addChild(appNode);
      }
    });

    // Documents 폴더 확인 및 생성
    if (!this.getNode('/Documents')) {
      const documents = new FileSystemNode('Documents', 'folder', '/Documents', this.root);
      this.root.addChild(documents);
    }

    // Images 폴더 확인 및 생성
    if (!this.getNode('/Images')) {
      const images = new FileSystemNode('Images', 'folder', '/Images', this.root);
      this.root.addChild(images);
    }

    // Music 폴더 확인 및 생성
    if (!this.getNode('/Music')) {
      const music = new FileSystemNode('Music', 'folder', '/Music', this.root);
      this.root.addChild(music);
    }

    // Trash 폴더 확인 및 생성
    if (!this.getNode('/Trash')) {
      const trash = new FileSystemNode('Trash', 'folder', '/Trash', this.root);
      trash.meta.icon = 'trash.png';
      this.root.addChild(trash);
    }

    this.saveToStorage();
  }

  /**
   * 검색 기능
   */
  search(rootPath = '/', pattern = '*') {
    const results = [];
    const rootNode = this.getNode(rootPath);
    
    if (!rootNode || rootNode.type !== 'folder') {
      return results;
    }

    const searchRecursive = (node) => {
      if (node.type === 'folder' && node.children) {
        node.children.forEach(child => {
          // 패턴 매칭 (간단한 와일드카드 지원)
          if (pattern === '*' || child.name.includes(pattern.replace('*', ''))) {
            results.push({
              name: child.name,
              type: child.type,
              path: child.path,
              meta: { ...child.meta }
            });
          }
          
          if (child.type === 'folder') {
            searchRecursive(child);
          }
        });
      }
    };

    searchRecursive(rootNode);
    return results;
  }
}

// 싱글톤 인스턴스 생성 및 export
const fileSystem = new FileSystem();

export default fileSystem;
export { FileSystem, FileSystemNode };

