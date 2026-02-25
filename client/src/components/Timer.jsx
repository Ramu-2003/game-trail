import { useEffect, useState } from 'react';

const Timer = ({ timeRemaining }) => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;

    const isLow = timeRemaining <= 30;
    const isCritical = timeRemaining <= 10;

    return (
        <div className={`timer ${isLow ? 'timer-low' : ''} ${isCritical ? 'timer-critical' : ''}`}>
            <div className="timer-display">
                <span className="timer-digit">{String(minutes).padStart(2, '0')}</span>
                <span className="timer-colon">:</span>
                <span className="timer-digit">{String(seconds).padStart(2, '0')}</span>
            </div>
            <div className="timer-bar">
                <div
                    className="timer-bar-fill"
                    style={{ width: `${(timeRemaining / 600) * 100}%` }}
                ></div>
            </div>
        </div>
    );
};

export default Timer;
