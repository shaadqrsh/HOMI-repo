export type user = {
  username: string;
  email: string;
};

export type folder = {
  id: string;
  name: string;
  parentfolderId: string | "TOP";
  type: "file";
};

export type file = {
  id: string;
  name: string;
  parentfolderId: string;
  type: "folder";
  title: string;
};

export type chat = {
  message: string;
  by_user: "question" | "answer";
  chat: string;
  time_stamp: string;
};

export type targetAttendance = {
  id: string;
  target: number;
};

export type subject = {
  id: string;
  subject: string;
  attended: number;
  total: number;
};

export type question = {
  id: string;
  text: string;
  answerId: string | null;
  fileId: string | null;
};

export type assignment = {
  id: string;
  subject: string;
  total_marks: number;
  due_date: string;
  note: string;
  submitted: boolean;
};

export const draggableItems = {
  FILE: "file",
  FOLDER: "folder",
};

export type testQuestion = {
  correctAnswer: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  question: string;
  question_id: string;
  userAnswer: string;
};

export type test = {
  test_id: string;
  subject: string;
  score: string;
  test_date: string;
};

export type testResult = {
  question_id: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  question: string;
  correctAnswer: string;
  userAnswer: string;
  is_correct: boolean;
  subject: string;
  score: string;
  explanation: string;
};

export type flashQuestion = {
  questionId: string;
  question: string;
  answer: string;
  category: "mastered" | "learning" | "review";
  flashcardId: string;
};
