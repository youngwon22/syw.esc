import React from 'react';
import { useChats } from '../hooks/useChats';
import styles from './ChatsApp.module.css';

function ChatsApp() {
  const {
    messages,
    inputMessage,
    isLoading,
    messagesEndRef,
    setInputMessage,
    sendMessage,
    handleKeyPress
  } = useChats();

  return (
    <div className={styles.chatsApp}>
      {/* 상단 바 */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <span className={styles.contactName}>@youngwon</span>
        </div>
      </div>

      {/* 채팅 영역 */}
      <div className={styles.chatArea}>
        <div className={styles.messagesContainer}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`${styles.messageWrapper} ${
                message.sender === 'user' ? styles.userMessage : styles.botMessage
              }`}
            >
              <div className={styles.messageBubble}>
                <div className={styles.messageContent}>
                  {message.content}
                </div>
                <div className={styles.messageInfo}>
                  <span className={styles.senderName}>
                    {message.sender === 'user' ? '나' : 'youngwon'}
                  </span>
                  <span className={styles.timestamp}>
                    {message.timestamp}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className={`${styles.messageWrapper} ${styles.botMessage}`}>
              <div className={styles.messageBubble}>
                <div className={styles.typingIndicator}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 하단 입력 영역 */}
      <div className={styles.inputArea}>
        <div className={styles.inputContainer}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className={styles.messageInput}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className={styles.sendButton}
          >
            📤
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatsApp;
