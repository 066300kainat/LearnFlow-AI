"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Brain } from "lucide-react";

type Question = {
  id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
};

type Quiz = {
  id: number;
  task_id: number;
  title: string;
  created_at: string;
  questions: Question[];
};

const API_URL = "http://127.0.0.1:8000";

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();

  const quizId = params.id;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    async function loadQuiz() {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_URL}/quizzes/${quizId}`
        );

        if (!response.ok) {
          throw new Error("Failed to load quiz");
        }

        const data = await response.json();

        setQuiz(data);
      } catch (error) {
        console.error("Quiz loading error:", error);
        setError("Unable to load quiz.");
      } finally {
        setLoading(false);
      }
    }

    if (quizId) {
      loadQuiz();
    }
  }, [quizId]);

  function selectAnswer(
    questionId: number,
    answer: string
  ) {
    if (submitted) return;

    setAnswers((previous) => ({
      ...previous,
      [questionId]: answer,
    }));
  }

  function submitQuiz() {
    if (!quiz) return;

    let calculatedScore = 0;

    quiz.questions.forEach((question) => {
      const selectedAnswer = answers[question.id];

      if (
        selectedAnswer &&
        selectedAnswer === question.correct_answer
      ) {
        calculatedScore++;
      }
    });

    setScore(calculatedScore);
    setSubmitted(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function getOptionClass(
    question: Question,
    option: string
  ) {
    const selected = answers[question.id];

    if (!submitted) {
      if (selected === option) {
        return "border-orange-500 bg-orange-50";
      }

      return "border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/40";
    }

    if (option === question.correct_answer) {
      return "border-green-500 bg-green-50";
    }

    if (
      selected === option &&
      option !== question.correct_answer
    ) {
      return "border-red-500 bg-red-50";
    }

    return "border-slate-200 bg-white";
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fc] p-8">
        <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <Brain
            size={40}
            className="mx-auto mb-4 animate-pulse text-orange-500"
          />

          <p className="text-slate-500">
            Loading your AI quiz...
          </p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-[#f7f8fc] p-8">
        <div className="mx-auto max-w-4xl">
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-2 text-sm font-medium text-indigo-600"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div className="rounded-2xl border border-red-200 bg-white p-10 text-center text-red-500">
            {error || "Quiz not found."}
          </div>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft size={17} />
            Back
          </button>

          <div className="flex items-center gap-2">
            <Brain
              size={21}
              className="text-orange-500"
            />

            <span className="font-bold">
              LearnFlow AI
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {!submitted ? (
          <>
            <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-orange-50 p-3 text-orange-500">
                  <Brain size={25} />
                </div>

                <div className="flex-1">
                  <h1 className="text-2xl font-bold">
                    {quiz.title}
                  </h1>

                  <p className="mt-2 text-sm text-slate-500">
                    Test your knowledge based on your
                    learning material.
                  </p>

                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-600">
                      {quiz.questions.length} Questions
                    </span>

                    <span className="text-slate-400">
                      {answeredCount} /{" "}
                      {quiz.questions.length} answered
                    </span>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-orange-500 transition-all"
                      style={{
                        width: `${
                          quiz.questions.length
                            ? (answeredCount /
                                quiz.questions.length) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {quiz.questions.map(
                (question, index) => (
                  <div
                    key={question.id}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="mb-5">
                      <span className="text-xs font-bold uppercase tracking-wide text-orange-500">
                        Question {index + 1}
                      </span>

                      <h2 className="mt-2 text-lg font-semibold leading-7 text-slate-800">
                        {question.question}
                      </h2>
                    </div>

                    <div className="space-y-3">
                      {[
                        {
                          key: "A",
                          text: question.option_a,
                        },
                        {
                          key: "B",
                          text: question.option_b,
                        },
                        {
                          key: "C",
                          text: question.option_c,
                        },
                        {
                          key: "D",
                          text: question.option_d,
                        },
                      ].map((option) => (
                        <button
                          key={option.key}
                          type="button"
                          disabled={submitted}
                          onClick={() =>
                            selectAnswer(
                              question.id,
                              option.key
                            )
                          }
                          className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${getOptionClass(
                            question,
                            option.key
                          )}`}
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                            {option.key}
                          </span>

                          <span className="pt-1 text-sm leading-6 text-slate-700">
                            {option.text}
                          </span>

                          {submitted &&
                            option.key ===
                              question.correct_answer && (
                              <CheckCircle2
                                size={20}
                                className="ml-auto mt-1 shrink-0 text-green-500"
                              />
                            )}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={submitQuiz}
                disabled={
                  answeredCount !==
                  quiz.questions.length
                }
                className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Submit Quiz
              </button>
            </div>

            {answeredCount !==
              quiz.questions.length && (
              <p className="mt-3 text-right text-xs text-slate-400">
                Please answer all questions before
                submitting.
              </p>
            )}
          </>
        ) : (
          <>
            <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                <CheckCircle2
                  size={34}
                  className="text-green-500"
                />
              </div>

              <h1 className="mt-5 text-2xl font-bold">
                Quiz Completed!
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                You scored
              </p>

              <div className="mt-3 text-5xl font-bold text-orange-500">
                {score}/{quiz.questions.length}
              </div>

              <p className="mt-3 text-sm font-medium text-slate-600">
                {Math.round(
                  (score / quiz.questions.length) * 100
                )}
                % correct
              </p>
            </div>

            <div className="space-y-6">
              {quiz.questions.map(
                (question, index) => {
                  const selected =
                    answers[question.id];

                  const isCorrect =
                    selected ===
                    question.correct_answer;

                  return (
                    <div
                      key={question.id}
                      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                    >
                      <div className="mb-4">
                        <span className="text-xs font-bold uppercase tracking-wide text-orange-500">
                          Question {index + 1}
                        </span>

                        <h2 className="mt-2 font-semibold leading-6 text-slate-800">
                          {question.question}
                        </h2>
                      </div>

                      <div className="space-y-2">
                        <div className="rounded-xl bg-slate-50 p-3 text-sm">
                          <span className="font-semibold">
                            Your answer:
                          </span>{" "}
                          {selected}
                        </div>

                        <div className="rounded-xl bg-green-50 p-3 text-sm text-green-700">
                          <span className="font-semibold">
                            Correct answer:
                          </span>{" "}
                          {question.correct_answer}
                        </div>

                        <div
                          className={`mt-3 rounded-xl p-3 text-sm font-medium ${
                            isCorrect
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {isCorrect
                            ? "Correct answer"
                            : "Incorrect answer"}
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            <div className="mt-8 flex justify-center gap-3">
              <button
                onClick={() => {
                  setAnswers({});
                  setSubmitted(false);
                  setScore(0);

                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
                }}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Try Again
              </button>

              <button
                onClick={() =>
                  router.push(
                    `/tasks/${quiz.task_id}`
                  )
                }
                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Back to Task
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}