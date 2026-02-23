import React, { useState, useRef, useEffect } from 'react';
import styles from './TerminalApp.module.css';
import fileSystem from '../core/FileSystem';

function TerminalApp() {
  const [currentPath, setCurrentPath] = useState('/');
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState([
    { type: 'system', text: 'Welcome to Terminal' },
    { type: 'system', text: 'Type "help" for available commands' }
  ]);
  const inputRef = useRef(null);
  const outputRef = useRef(null);

  // 출력 스크롤
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  // 포커스 관리ㅇ0
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // 명령어 파싱
  const parseCommand = (cmd) => {
    const parts = cmd.trim().split(/\s+/);
    return {
      command: parts[0] || '',
      args: parts.slice(1)
    };
  };

  // 경로 정규화
  const normalizePath = (path, basePath = currentPath) => {
    if (path.startsWith('/')) {
      return path;
    }
    if (basePath === '/') {
      return `/${path}`;
    }
    return `${basePath}/${path}`;
  };

  // ls 명령어
  const handleLs = (args) => {
    try {
      const targetPath = args[0] ? normalizePath(args[0]) : currentPath;
      const files = fileSystem.list(targetPath);
      
      if (files.length === 0) {
        return 'Directory is empty';
      }

      return files.map(file => {
        const type = file.type === 'folder' ? '📁' : file.type === 'app' ? '📱' : '📄';
        return `${type} ${file.name}`;
      }).join('\n');
    } catch (error) {
      return `Error: ${error.message}`;
    }
  };

  // cd 명령어
  const handleCd = (args) => {
    if (args.length === 0) {
      setCurrentPath('/');
      return '';
    }

    try {
      const targetPath = normalizePath(args[0]);
      const node = fileSystem.getNode(targetPath);
      
      if (!node) {
        return `Error: Directory not found: ${targetPath}`;
      }
      if (node.type !== 'folder') {
        return `Error: Not a directory: ${targetPath}`;
      }

      setCurrentPath(targetPath);
      return '';
    } catch (error) {
      return `Error: ${error.message}`;
    }
  };

  // pwd 명령어
  const handlePwd = () => {
    return currentPath;
  };

  // cat 명령어
  const handleCat = (args) => {
    if (args.length === 0) {
      return 'Error: cat requires a file path';
    }

    try {
      const filePath = normalizePath(args[0]);
      const file = fileSystem.read(filePath);
      return file.content;
    } catch (error) {
      return `Error: ${error.message}`;
    }
  };

  // mkdir 명령어
  const handleMkdir = (args) => {
    if (args.length === 0) {
      return 'Error: mkdir requires a directory name';
    }

    try {
      const dirPath = normalizePath(args[0]);
      fileSystem.createFolder(dirPath);
      return `Directory created: ${dirPath}`;
    } catch (error) {
      return `Error: ${error.message}`;
    }
  };

  // touch 명령어
  const handleTouch = (args) => {
    if (args.length === 0) {
      return 'Error: touch requires a file name';
    }

    try {
      const filePath = normalizePath(args[0]);
      fileSystem.write(filePath, '', { mimeType: 'text/plain' });
      return `File created: ${filePath}`;
    } catch (error) {
      return `Error: ${error.message}`;
    }
  };

  // rm 명령어
  const handleRm = (args) => {
    if (args.length === 0) {
      return 'Error: rm requires a file or directory name';
    }

    try {
      const targetPath = normalizePath(args[0]);
      fileSystem.delete(targetPath);
      return `Deleted: ${targetPath}`;
    } catch (error) {
      return `Error: ${error.message}`;
    }
  };

  // help 명령어
  const handleHelp = () => {
    return `Available commands:
  ls [path]     - List directory contents
  cd [path]     - Change directory
  pwd           - Print working directory
  cat <file>    - Display file contents
  mkdir <dir>   - Create directory
  touch <file>  - Create empty file
  rm <path>     - Delete file or directory
  clear         - Clear terminal
  help          - Show this help message`;
  };

  // clear 명령어
  const handleClear = () => {
    setOutput([]);
    return '';
  };

  // 명령어 실행
  const executeCommand = (cmd) => {
    const { command, args } = parseCommand(cmd);

    switch (command.toLowerCase()) {
      case 'ls':
        return handleLs(args);
      case 'cd':
        return handleCd(args);
      case 'pwd':
        return handlePwd();
      case 'cat':
        return handleCat(args);
      case 'mkdir':
        return handleMkdir(args);
      case 'touch':
        return handleTouch(args);
      case 'rm':
        return handleRm(args);
      case 'clear':
        return handleClear();
      case 'help':
        return handleHelp();
      case '':
        return '';
      default:
        return `Command not found: ${command}. Type "help" for available commands.`;
    }
  };

  // 입력 처리
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!input.trim()) {
      return;
    }

    const command = input.trim();
    const result = executeCommand(command);

    // 히스토리에 추가
    setHistory(prev => [...prev, command]);
    
    // 출력에 추가
    setOutput(prev => [
      ...prev,
      { type: 'command', text: `$ ${command}` },
      ...(result ? [{ type: 'output', text: result }] : [])
    ]);

    setInput('');
  };

  // 키보드 이벤트 (히스토리 네비게이션)
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp' && history.length > 0) {
      e.preventDefault();
      const lastCommand = history[history.length - 1];
      setInput(lastCommand);
    }
  };

  return (
    <div className={styles.terminal}>
      <div ref={outputRef} className={styles.output}>
        {output.map((item, index) => (
          <div key={index} className={styles[item.type]}>
            {item.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className={styles.inputContainer}>
        <span className={styles.prompt}>
          {currentPath === '/' ? '/' : currentPath} $ 
        </span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className={styles.input}
          autoFocus
        />
      </form>
    </div>
  );
}

export default TerminalApp;

