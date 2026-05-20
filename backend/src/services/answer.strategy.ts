import { TaskType } from '@prisma/client';

// Strategy interface
interface AnswerStrategy {
  verify(userAnswer: string, correctAnswer: string): boolean;
}

// Concrete strategies
class TextAnswerStrategy implements AnswerStrategy {
  verify(userAnswer: string, correctAnswer: string): boolean {
    return userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
  }
}

class NumberAnswerStrategy implements AnswerStrategy {
  verify(userAnswer: string, correctAnswer: string): boolean {
    const userNum = parseFloat(userAnswer);
    const correctNum = parseFloat(correctAnswer);
    if (isNaN(userNum) || isNaN(correctNum)) return false;
    return Math.abs(userNum - correctNum) < 0.01;
  }
}

class ChoiceAnswerStrategy implements AnswerStrategy {
  verify(userAnswer: string, correctAnswer: string): boolean {
    return userAnswer.trim().toUpperCase() === correctAnswer.trim().toUpperCase();
  }
}

// Strategy factory
const strategies: Record<TaskType, AnswerStrategy> = {
  TEXT: new TextAnswerStrategy(),
  NUMBER: new NumberAnswerStrategy(),
  CHOICE: new ChoiceAnswerStrategy(),
};

export function verifyAnswer(taskType: TaskType, userAnswer: string, correctAnswer: string): boolean {
  const strategy = strategies[taskType] ?? strategies.TEXT;
  return strategy.verify(userAnswer, correctAnswer);
}
