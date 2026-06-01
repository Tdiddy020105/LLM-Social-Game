import {
  CONFIDENCE_LINE,
  DIFFICULTY_LINE,
  REFLECT_LINE,
  SESSION_END_KID,
  feedbackLine,
  levelHint,
  taskHint,
} from "./lessonScript.js";

export function getLessonFallback(context) {
  const { phase, taskType, correct, mistakeCount } = context;

  if (phase === "difficulty_ask") return DIFFICULTY_LINE.line;
  if (phase === "reflect_certain" || phase === "reflect_slow") {
    return REFLECT_LINE.line;
  }
  if (phase === "task_explain") return taskHint(taskType).line;
  if (phase === "level_up") return levelHint().line;
  if (phase === "feedback_correct") return feedbackLine(true).line;
  if (phase === "feedback_wrong") {
    return feedbackLine(false, mistakeCount).line;
  }
  if (phase === "confidence_start") {
    return mistakeCount >= 3
      ? feedbackLine(false, 3).line
      : CONFIDENCE_LINE.line;
  }
  if (phase === "session_end") return SESSION_END_KID.line;

  return "Laten we verder gaan.";
}
