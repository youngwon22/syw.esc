import React from 'react';
import styles from './AppIcon.module.css';

function AppIcon({ iconSrc, appName, onDoubleClick }) {
  return (
    <div className={styles.appIcon} onDoubleClick={onDoubleClick}>
      <div className={styles.iconWrapper}>
        <img src={iconSrc} alt={appName} className={styles.icon} />
      </div>
      <div className={styles.label}>{appName}</div>
    </div>
  );
}

export default AppIcon;


