import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Timer = () => {
  const [timeLeft, setTimeLeft] = useState(5); // Initial countdown time before timer starts
  const [timer, setTimer] = useState(60); // Timer duration
  const [countdownActive, setCountdownActive] = useState(true); // Flag to control countdown display

  useEffect(() => {
    const interval = setInterval(() => {
      if (countdownActive) {
        setTimeLeft(prevTime => prevTime - 1);
        if (timeLeft === 1) {
          setCountdownActive(false);
        }
      } else {
        if (timer === 5) {
          // Execute a reminder 5 seconds before timer ends
          // You can customize the reminder functionality here
          alert("5 seconds remaining!");
        }
        if (timer === 0) {
          clearInterval(interval);
          // Timer has ended, you can trigger any desired action here
          alert("Timer ended!");
        } else {
          setTimer(prevTimer => prevTimer - 1);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [countdownActive, timeLeft, timer]);

  // Format timer display
const formatTime = (time: number) => {
    return time < 10 ? `0${time}` : time;
};

  return (
    <View style={styles.container}>
      <Text style={styles.timerText}>
        {countdownActive ? `Countdown: ${timeLeft}` : `Timer: ${formatTime(Math.floor(timer / 60))}:${formatTime(timer % 60)}`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 24,
    color: '#fff'
  },
});

export default Timer;
