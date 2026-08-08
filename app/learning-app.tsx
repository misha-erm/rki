"use client";

import { useMemo, useState } from "react";
import * as course from "./course-data";

type CourseModule = {
  id: string;
  title: string;
  level?: string;
  topic?: string;
  lessons?: number;
  progress?: number;
  accent?: string;
  description?: string;
  grammar?: string;
  exercises?: Record<string, unknown>[];
};

type ExerciseKind = "ending" | "fill" | "choice";
type Exercise = {
  id: string;
  kind: ExerciseKind;
  label: string;
  instruction: string;
  before?: string;
  after?: string;
  prompt?: string;
  answer: string;
  choices?: string[];
  explanation: string;
};

type Flashcard = { id: string; front: string; back: string; hint?: string };

const fallbackModules: CourseModule[] = [
  { id: "accusative", title: "Винительный падеж", level: "A1", topic: "Существительные", lessons: 6, progress: 58, accent: "#ee765b" },
  { id: "verbs", title: "Глаголы: основа", level: "A1", topic: "Настоящее время", lessons: 4, progress: 25, accent: "#2b5762" },
  { id: "vocabulary", title: "Мой день", level: "A1", topic: "Лексика", lessons: 3, progress: 0, accent: "#77996c" },
];

const fallbackExercises: Exercise[] = [
  {
    id: "ending-rabotat",
    kind: "ending",
    label: "Окончание",
    instruction: "Напишите окончание глагола.",
    before: "Он работа",
    after: " в офисе.",
    answer: "ет",
    explanation: "Он — это 3-е лицо единственного числа. У глагола «работать» окончание «-ет».",
  },
  {
    id: "fill-rabotat",
    kind: "fill",
    label: "Форма глагола",
    instruction: "Вставьте глагол «работать» в правильной форме.",
    prompt: "Маша ______ дома.",
    answer: "работает",
    explanation: "Маша = она, 3-е лицо единственного числа: «работает».",
  },
  {
    id: "aspect-uchit",
    kind: "choice",
    label: "Вид глагола",
    instruction: "Выберите подходящий вид глагола.",
    prompt: "Вчера я весь вечер ______ русский язык.",
    answer: "учил",
    choices: ["учил", "выучил"],
    explanation: "«Весь вечер» описывает процесс, поэтому нужен несовершенный вид: «учил».",
  },
];

const fallbackCards: Flashcard[] = [
  { id: "office", front: "офис", back: "office", hint: "мужской род" },
  { id: "work", front: "работать", back: "to work", hint: "несовершенный вид" },
  { id: "home", front: "дома", back: "at home", hint: "наречие" },
];

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function normalizeModules(): CourseModule[] {
  const source = asArray<Record<string, unknown>>(
    (course as Record<string, unknown>).courseModules ?? (course as Record<string, unknown>).modules,
  );
  if (!source.length) return fallbackModules;
  return source.map((item, index) => ({
    id: String(item.id ?? `module-${index}`),
    title: String(item.title ?? item.name ?? "Новый модуль"),
    level: typeof item.level === "string" ? item.level : "A1",
    topic: typeof item.topic === "string" ? item.topic : typeof item.grammar === "string" ? item.grammar : typeof item.description === "string" ? item.description : "Русский язык",
    lessons: typeof item.lessons === "number" ? item.lessons : undefined,
    progress: typeof item.progress === "number" ? item.progress : 0,
    accent: typeof item.accent === "string" ? item.accent : undefined,
    description: typeof item.description === "string" ? item.description : undefined,
    grammar: typeof item.grammar === "string" ? item.grammar : undefined,
    exercises: asArray<Record<string, unknown>>(item.exercises),
  }));
}

function normalizeExercises(moduleId: string): Exercise[] {
  const allModules = asArray<Record<string, unknown>>(
    (course as Record<string, unknown>).courseModules ?? (course as Record<string, unknown>).modules,
  );
  const selectedModule = allModules.find((item) => item.id === moduleId);
  const source = asArray<Record<string, unknown>>(selectedModule?.exercises);
  if (!source.length) return fallbackExercises;
  return source.map((item, index) => {
    const rawType = String(item.kind ?? item.type ?? "fill");
    const kind: ExerciseKind = rawType === "choice" || rawType === "aspect" ? "choice" : rawType === "ending" ? "ending" : "fill";
    const answer = String(item.answer ?? item.correctAnswer ?? "");
    const sentence = typeof item.sentence === "string" ? item.sentence : typeof item.prompt === "string" ? item.prompt : undefined;
    const blankParts = sentence?.split(/_{2,}/) ?? [];
    return {
      id: String(item.id ?? `exercise-${index}`),
      kind,
      label: String(item.label ?? (kind === "choice" ? "Вид глагола" : kind === "ending" ? "Окончание" : "Форма глагола")),
      instruction: String(item.instruction ?? item.question ?? (item.sentence ? item.prompt : undefined) ?? "Допишите правильное окончание."),
      before: typeof item.before === "string" ? item.before : blankParts[0],
      after: typeof item.after === "string" ? item.after : blankParts[1],
      prompt: sentence,
      answer,
      choices: kind === "choice" ? asArray<string>(item.choices ?? item.options) : undefined,
      explanation: String(item.explanation ?? item.hint ?? "Проверьте форму глагола и попробуйте ещё раз."),
    };
  });
}

function normalizeCards(): Flashcard[] {
  const source = asArray<Record<string, unknown>>(
    (course as Record<string, unknown>).flashcards,
  );
  if (!source.length) return fallbackCards;
  return source.map((item, index) => ({
    id: String(item.id ?? `card-${index}`),
    front: String(item.front ?? item.word ?? item.russian ?? ""),
    back: String(item.back ?? item.translation ?? item.meaning ?? ""),
    hint: typeof item.hint === "string" ? item.hint : typeof item.example === "string" ? item.example : typeof item.note === "string" ? item.note : undefined,
  }));
}

function isCorrect(value: string, exercise: Exercise) {
  const normalizedValue = value.trim().toLocaleLowerCase("ru");
  const normalizedAnswer = exercise.answer.trim().toLocaleLowerCase("ru");
  if (normalizedValue === normalizedAnswer) return true;

  // Authors can keep the pedagogically clearer full form in the data
  // ("работает") while the UI asks only for its ending ("ет").
  if (exercise.kind === "ending" && exercise.before) {
    const stem = exercise.before.trim().split(/\s+/).at(-1)?.toLocaleLowerCase("ru") ?? "";
    if (stem && normalizedAnswer.startsWith(stem)) {
      return normalizedValue === normalizedAnswer.slice(stem.length);
    }
  }
  return false;
}

export default function LearningApp() {
  const modules = useMemo(() => normalizeModules(), []);
  const cards = useMemo(() => normalizeCards(), []);
  const [activeModule, setActiveModule] = useState(
    modules.find((module) => module.id === "verbs-present-imperfective")?.id ?? modules[0]?.id ?? "accusative",
  );
  const exercises = useMemo(() => normalizeExercises(activeModule), [activeModule]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [cardIndex, setCardIndex] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState(0);

  const activeModuleData = modules.find((module) => module.id === activeModule) ?? modules[0];
  const savedProgress = (course as Record<string, unknown>).studentProgress as { completedModuleIds?: string[]; currentStreak?: number } | undefined;
  const progress = Math.round(((savedProgress?.completedModuleIds?.length ?? 0) / Math.max(modules.length, 1)) * 100);
  const streak = savedProgress?.currentStreak ?? 0;
  const card = cards[cardIndex % cards.length] ?? fallbackCards[0];
  const completedCount = Object.entries(checked).filter(([id, value]) => {
    const exercise = exercises.find((item) => item.id === id);
    return value && Boolean(exercise) && isCorrect(answers[id] ?? "", exercise!);
  }).length;

  function checkExercise(exercise: Exercise) {
    setChecked((current) => ({ ...current, [exercise.id]: true }));
  }

  function advanceCard(known: boolean) {
    if (known) setKnownCards((value) => value + 1);
    setCardFlipped(false);
    setCardIndex((value) => (value + 1) % cards.length);
  }

  return (
    <main className="min-h-screen bg-[#f8f1e6] text-[#173b47] selection:bg-[#f4b39d] selection:text-[#173b47]">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <button
          type="button"
          aria-label="Открыть меню курса"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((value) => !value)}
          className="fixed left-4 top-4 z-50 grid h-11 w-11 place-items-center rounded-full border border-[#173b47]/15 bg-[#fffaf2] text-xl shadow-sm lg:hidden"
        >
          ☰
        </button>

        <aside className={`${menuOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-40 flex w-[292px] flex-col border-r border-[#173b47]/10 bg-[#fffaf2] px-5 pb-6 pt-7 shadow-xl transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shadow-none`}>
          <div className="mb-10 flex items-center gap-3 pl-1">
            <div className="grid h-11 w-11 place-items-center rounded-[16px] bg-[#ed765b] text-2xl text-[#fffaf2]">Я</div>
            <div>
              <p className="font-serif text-[22px] leading-none text-[#173b47]">По-русски</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#173b47]/50">русский для жизни</p>
            </div>
          </div>

          <nav aria-label="Разделы курса" className="min-h-0 flex-1 overflow-y-auto">
            <p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#173b47]/45">Ваш курс</p>
            <div className="space-y-1">
              {modules.map((module, index) => {
                const active = module.id === activeModule;
                return (
                  <button
                    key={module.id}
                    type="button"
                    onClick={() => { setActiveModule(module.id); setMenuOpen(false); }}
                    className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${active ? "bg-[#173b47] text-[#fffaf2] shadow-md" : "text-[#173b47]/75 hover:bg-[#f3e8d8]"}`}
                  >
                    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${active ? "bg-[#f4b39d] text-[#173b47]" : "bg-[#e7efe0] text-[#58784f]"}`}>{index + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{module.title}</span>
                      <span className={`mt-0.5 block text-xs ${active ? "text-[#fffaf2]/60" : "text-[#173b47]/45"}`}>{module.topic}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="mt-5 rounded-[22px] bg-[#e6eedf] p-4">
            <div className="flex items-center justify-between text-sm"><span className="font-semibold">Моя серия</span><span className="text-[#58784f]">{streak} дня</span></div>
            <div className="mt-3 flex gap-1.5" aria-label={`Учебная серия: ${streak} дня`}>
              {[1, 2, 3, 4, 5, 6, 7].map((day) => <span key={day} className={`h-2 flex-1 rounded-full ${day <= streak ? "bg-[#77996c]" : "bg-[#c2d0b9]"}`} />)}
            </div>
          </div>
        </aside>

        {menuOpen && <button type="button" aria-label="Закрыть меню" onClick={() => setMenuOpen(false)} className="fixed inset-0 z-30 bg-[#173b47]/30 lg:hidden" />}

        <section className="w-full overflow-hidden px-5 pb-16 pt-20 sm:px-8 lg:px-12 lg:pt-10 xl:px-16">
          <header className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#77996c]">Пятница, 8 августа</p>
              <h1 className="mt-2 font-serif text-4xl tracking-[-0.035em] text-[#173b47] sm:text-5xl">Добрый день!</h1>
              <p className="mt-3 max-w-lg text-[15px] leading-6 text-[#173b47]/65">Сегодня разберём форму глагола — спокойно, на живых примерах и в своём темпе.</p>
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-[#173b47]/10 bg-[#fffaf2] px-3 py-2 sm:flex">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#f4b39d] text-sm">У</span>
              <span className="pr-1 text-sm font-semibold">Ученик</span>
            </div>
          </header>

          <div className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(290px,0.7fr)]">
            <article className="relative overflow-hidden rounded-[30px] bg-[#173b47] p-7 text-[#fffaf2] sm:p-9">
              <div className="absolute -right-12 -top-16 h-44 w-44 rounded-full border-[22px] border-[#ed765b]/80" />
              <div className="relative max-w-xl">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#f4b39d]"><span className="h-2 w-2 rounded-full bg-[#f4b39d]" /> Продолжить урок</div>
                <h2 className="mt-5 font-serif text-3xl leading-tight sm:text-4xl">{activeModuleData?.title}</h2>
                <p className="mt-3 max-w-md text-[15px] leading-6 text-[#fffaf2]/70">{activeModuleData?.description}</p>
                <div className="mt-7 flex flex-wrap items-center gap-4">
                  <button type="button" onClick={() => document.getElementById("practice")?.scrollIntoView({ behavior: "smooth" })} className="rounded-full bg-[#ed765b] px-5 py-3 text-sm font-bold text-[#fffaf2] transition hover:bg-[#f18c74]">Начать урок <span aria-hidden="true">→</span></button>
                  <span className="text-sm text-[#fffaf2]/65">{activeModuleData?.level} · {exercises.length} {exercises.length === 1 ? "задание" : exercises.length < 5 ? "задания" : "заданий"}</span>
                </div>
              </div>
            </article>

            <article className="rounded-[30px] border border-[#173b47]/10 bg-[#fffaf2] p-6 sm:p-7">
              <div className="flex items-start justify-between">
                <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#173b47]/45">Ваш прогресс</p><p className="mt-2 font-serif text-4xl">{progress}%</p></div>
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#e6eedf] text-[#58784f]">↗</span>
              </div>
              <div className="mt-6 h-3 overflow-hidden rounded-full bg-[#efe5d6]"><div className="h-full rounded-full bg-[#77996c] transition-all" style={{ width: `${progress}%` }} /></div>
              <p className="mt-4 text-sm leading-5 text-[#173b47]/60">{completedCount ? `Сегодня уже решено: ${completedCount} из ${exercises.length} заданий.` : "До следующего уровня — всего 4 урока."}</p>
            </article>
          </div>

          <section id="practice" aria-labelledby="practice-title" className="mt-12 scroll-mt-6">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
              <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ed765b]">Практика</p><h2 id="practice-title" className="mt-1 font-serif text-3xl">Потренируемся?</h2></div>
              <p className="text-sm text-[#173b47]/55">{completedCount}/{exercises.length} верно</p>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {exercises.map((exercise, index) => {
                const value = answers[exercise.id] ?? "";
                const hasChecked = checked[exercise.id];
                const correct = hasChecked && isCorrect(value, exercise);
                return (
                  <article key={exercise.id} className="flex min-h-[298px] flex-col rounded-[26px] border border-[#173b47]/10 bg-[#fffaf2] p-6">
                    <div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-[0.14em] text-[#173b47]/45">0{index + 1} · {exercise.label}</span><span className="text-[#ed765b]">✦</span></div>
                    <p className="mt-5 text-sm leading-5 text-[#173b47]/65">{exercise.instruction}</p>
                    <div className="mt-5 text-[18px] font-medium leading-8 text-[#173b47]">
                      {exercise.kind === "ending" ? <label className="flex flex-wrap items-baseline gap-0"><span>{exercise.before}</span><input aria-label="Окончание слова" value={value} onChange={(event) => { setAnswers((current) => ({ ...current, [exercise.id]: event.target.value })); setChecked((current) => ({ ...current, [exercise.id]: false })); }} className="mx-1 w-20 border-b-2 border-[#ed765b] bg-transparent px-1 text-center outline-none focus:border-[#173b47]" /><span>{exercise.after}</span></label> : exercise.choices?.length ? <><p>{exercise.prompt?.replace(/_{2,}/, "___")}</p><div className="mt-3 flex flex-wrap gap-2">{exercise.choices.map((choice) => <button key={choice} type="button" onClick={() => { setAnswers((current) => ({ ...current, [exercise.id]: choice })); setChecked((current) => ({ ...current, [exercise.id]: false })); }} aria-pressed={value === choice} className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${value === choice ? "border-[#173b47] bg-[#173b47] text-[#fffaf2]" : "border-[#173b47]/15 bg-[#f8f1e6] hover:border-[#ed765b]"}`}>{choice}</button>)}</div></> : <label><span className="sr-only">Правильная форма слова</span><span>{(exercise.prompt ?? "").split(/_{2,}/)[0]}</span><input aria-label="Правильная форма слова" value={value} onChange={(event) => { setAnswers((current) => ({ ...current, [exercise.id]: event.target.value })); setChecked((current) => ({ ...current, [exercise.id]: false })); }} className="mx-1 w-32 border-b-2 border-[#ed765b] bg-transparent px-1 text-center outline-none focus:border-[#173b47]" /><span>{(exercise.prompt ?? "").split(/_{2,}/)[1]}</span></label>}
                    </div>
                    <div className="mt-auto pt-5">
                      {hasChecked ? <div role="status" className={`mb-3 rounded-xl px-3 py-2 text-xs leading-4 ${correct ? "bg-[#e6eedf] text-[#45643f]" : "bg-[#fce4dc] text-[#9b4130]"}`}><strong>{correct ? "Верно! " : "Почти. "}</strong>{correct ? exercise.explanation : `Правильный ответ: «${exercise.answer}». ${exercise.explanation}`}</div> : null}
                      <button type="button" disabled={!value.trim()} onClick={() => checkExercise(exercise)} className="w-full rounded-full border border-[#173b47] px-4 py-2.5 text-sm font-bold transition hover:bg-[#173b47] hover:text-[#fffaf2] disabled:cursor-not-allowed disabled:border-[#173b47]/20 disabled:text-[#173b47]/30 disabled:hover:bg-transparent disabled:hover:text-[#173b47]/30">Проверить</button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section aria-labelledby="cards-title" className="mt-12 grid items-center gap-8 rounded-[30px] bg-[#e6eedf] p-6 sm:p-9 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#58784f]">Повторение</p>
              <h2 id="cards-title" className="mt-2 font-serif text-3xl leading-tight">Слова остаются, когда к ним возвращаешься.</h2>
              <p className="mt-3 max-w-sm text-sm leading-6 text-[#173b47]/65">Переверните карточку, вспомните значение и честно оцените себя.</p>
              <div className="mt-5 inline-flex rounded-full bg-[#fffaf2]/70 px-3 py-1.5 text-xs font-semibold text-[#58784f]">Знаю сегодня: {knownCards}</div>
            </div>
            <div className="mx-auto w-full max-w-md">
              <button type="button" onClick={() => setCardFlipped((value) => !value)} aria-label={cardFlipped ? "Показать русское слово" : "Показать перевод"} className="group w-full text-left [perspective:1000px]">
                <div className={`relative h-48 w-full transition-transform duration-500 [transform-style:preserve-3d] ${cardFlipped ? "[transform:rotateY(180deg)]" : ""}`}>
                  <div className="absolute inset-0 flex flex-col justify-between rounded-[26px] bg-[#fffaf2] p-6 shadow-sm [backface-visibility:hidden]"><span className="text-xs font-bold uppercase tracking-[0.16em] text-[#173b47]/40">Русский</span><span className="font-serif text-4xl text-[#173b47]">{card.front}</span><span className="text-xs text-[#173b47]/45">Нажмите, чтобы перевернуть</span></div>
                  <div className="absolute inset-0 flex flex-col justify-between rounded-[26px] bg-[#173b47] p-6 text-[#fffaf2] shadow-sm [backface-visibility:hidden] [transform:rotateY(180deg)]"><span className="text-xs font-bold uppercase tracking-[0.16em] text-[#f4b39d]">Значение</span><span className="font-serif text-4xl">{card.back}</span><span className="text-xs text-[#fffaf2]/55">{card.hint ?? "Нажмите, чтобы вернуться"}</span></div>
                </div>
              </button>
              <div className="mt-4 grid grid-cols-2 gap-3"><button type="button" onClick={() => advanceCard(false)} className="rounded-full border border-[#173b47]/20 bg-[#fffaf2] px-4 py-3 text-sm font-bold transition hover:border-[#ed765b] hover:text-[#a94c39]">Повторить</button><button type="button" onClick={() => advanceCard(true)} className="rounded-full bg-[#77996c] px-4 py-3 text-sm font-bold text-[#fffaf2] transition hover:bg-[#668b5d]">Знаю <span aria-hidden="true">→</span></button></div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
