export type Level = "A1" | "A2";
export type ExerciseType = "ending" | "form" | "aspect";

export type Exercise = {
  id: string;
  type: ExerciseType;
  prompt: string;
  sentence?: string;
  answer: string;
  options?: string[];
  hint?: string;
};

export type LessonModule = {
  id: string;
  level: Level;
  title: string;
  grammar: string;
  description: string;
  exercises: Exercise[];
};

export type Flashcard = {
  id: string;
  level: Level;
  front: string;
  back: string;
  example: string;
  topic: "food" | "city" | "study" | "work";
};

const ending = (id: string, prompt: string, answer: string, hint?: string): Exercise => ({
  id, type: "ending", prompt, answer, hint,
});
const form = (id: string, sentence: string, answer: string, options: string[]): Exercise => ({
  id, type: "form", prompt: "Вставьте глагол в правильной форме.", sentence, answer, options,
});
const aspect = (id: string, sentence: string, answer: string, options: string[], hint: string): Exercise => ({
  id, type: "aspect", prompt: "Выберите подходящий вид глагола: НСВ или СВ.", sentence, answer,
  options, hint,
});

export const levels: { id: Level; title: string; description: string }[] = [
  { id: "A1", title: "A1 · Начало", description: "Базовые формы, частотная лексика и простые фразы." },
  { id: "A2", title: "A2 · Уверенный базовый", description: "Падежи, виды глагола и более длинные высказывания." },
];

export const courseModules: LessonModule[] = [
  {
    id: "acc-inanimate-singular", level: "A1", title: "Винительный падеж: неодушевлённые, ед. число",
    grammar: "В.п. = И.п.", description: "После «видеть», «покупать», «читать» форма неодушевлённого существительного не меняется.",
    exercises: [
      ending("a1-acc-1", "Я читаю журнал__.", "журнал", "Неодушевлённое существительное, ед. число."),
      ending("a1-acc-2", "Анна покупает билет__.", "билет"),
    ],
  },
  {
    id: "acc-inanimate-plural", level: "A1", title: "Винительный падеж: неодушевлённые, мн. число",
    grammar: "В.п. = И.п.", description: "Во множественном числе у неодушевлённых слов форма также совпадает с именительным.",
    exercises: [
      ending("a1-acc-3", "Мы видим нов__ дом__.", "новые дома"),
      ending("a1-acc-4", "Туристы фотографируют красив__ улиц__.", "красивые улицы"),
    ],
  },
  {
    id: "acc-animate-singular", level: "A1", title: "Винительный падеж: одушевлённые, ед. число",
    grammar: "м.р.: -а / -я; ж.р.: -у / -ю", description: "Одушевлённые существительные обычно отвечают на вопрос «кого?». ",
    exercises: [
      ending("a1-acc-5", "Я знаю студент__.", "студента"),
      ending("a1-acc-6", "Иван встречает сестр__.", "сестру"),
    ],
  },
  {
    id: "acc-animate-plural", level: "A2", title: "Винительный падеж: одушевлённые, мн. число",
    grammar: "В.п. = Р.п. мн. числа", description: "Для людей и животных во множественном числе используйте форму родительного падежа.",
    exercises: [
      ending("a2-acc-1", "Мы встречаем студент__.", "студентов"),
      ending("a2-acc-2", "Дети любят собак__.", "собак"),
    ],
  },
  {
    id: "acc-adjectives-pronouns-singular", level: "A2", title: "Прилагательные и местоимения: ед. число",
    grammar: "м.р. -ого/-его, ж.р. -ую/-юю, ср.р. как И.п.", description: "Прилагательное и местоимение согласуются с существительным в винительном падеже.",
    exercises: [
      ending("a2-acc-3", "Я вижу нов__ учител__.", "нового учителя"),
      ending("a2-acc-4", "Она читает эт__ интересн__ книг__.", "эту интересную книгу"),
    ],
  },
  {
    id: "acc-adjectives-pronouns-plural", level: "A2", title: "Прилагательные и местоимения: мн. число",
    grammar: "неодуш.: -ые/-ие; одуш.: -ых/-их", description: "Форма зависит от одушевлённости существительного.",
    exercises: [
      ending("a2-acc-5", "Я знаю эт__ хорош__ врач__.", "этих хороших врачей"),
      ending("a2-acc-6", "Мы покупаем эт__ нов__ словар__.", "эти новые словари"),
    ],
  },
  {
    id: "verbs-present-imperfective", level: "A1", title: "4 глагола: настоящее время НСВ",
    grammar: "работать: работаю; жить: живу; учить: учу", description: "НСВ в настоящем времени: действие происходит регулярно или сейчас. У «выучить» нет настоящего времени.",
    exercises: [
      ending("v-pres-1", "Он работа__ в офисе.", "работает", "Окончание для «он» — -ет."),
      ending("v-pres-2", "Мы работа__ в банке.", "работаем"),
      form("v-pres-3", "Маша ___ в Москве.", "живёт", ["живёт", "живут", "жил"]),
      form("v-pres-4", "Я ___ русский язык каждый день.", "учу", ["учу", "учит", "учил"]),
    ],
  },
  {
    id: "verbs-past-imperfective", level: "A1", title: "4 глагола: прошедшее время НСВ",
    grammar: "работал / работала / работали", description: "НСВ в прошедшем времени описывает процесс, привычку или фон.",
    exercises: [
      ending("v-past-1", "Вчера он работа__ дома.", "работал"),
      ending("v-past-2", "Раньше Маша жи__ в Казани.", "жила"),
      form("v-past-3", "Вчера мы ___ новые слова два часа.", "учили", ["учили", "выучили", "учим"]),
    ],
  },
  {
    id: "verbs-aspect-pairs", level: "A2", title: "Видовые пары: учить / выучить",
    grammar: "учить (НСВ) — выучить (СВ)", description: "НСВ — процесс или повторение; СВ — завершённый результат.",
    exercises: [
      aspect("v-aspect-1", "Вчера я весь вечер ___ русский язык.", "учил", ["учил", "выучил"], "«Весь вечер» описывает процесс, поэтому нужен НСВ: «учил»."),
      aspect("v-aspect-2", "К пятнице Анна ___ этот диалог.", "выучит", ["будет учить", "выучит"], "Есть срок и ожидаемый результат, поэтому нужен СВ: «выучит»."),
      aspect("v-aspect-3", "В прошлом году мы каждый день ___ новые слова.", "учили", ["учили", "выучили"], "Повторяющееся действие требует НСВ: «учили»."),
    ],
  },
  {
    id: "verbs-future-aspects", level: "A2", title: "Будущее время НСВ и СВ",
    grammar: "буду учить / выучу", description: "НСВ: «буду + инфинитив»; СВ: простое будущее («выучу»).",
    exercises: [
      form("v-future-1", "Завтра я ___ русский язык два часа.", "буду учить", ["буду учить", "выучу", "учил"]),
      form("v-future-2", "К экзамену я ___ все слова.", "выучу", ["буду учить", "выучу", "учить"]),
      aspect("v-future-3", "Летом мы ___ в Санкт-Петербурге три месяца.", "будем работать", ["будем работать", "поработаем"], "Длительность «три месяца» подчёркивает процесс: «будем работать»."),
    ],
  },
];

export const flashcards: Flashcard[] = [
  { id: "f-1", level: "A1", front: "работать", back: "to work", example: "Я работаю в банке.", topic: "work" },
  { id: "f-2", level: "A1", front: "жить", back: "to live", example: "Они живут в Москве.", topic: "city" },
  { id: "f-3", level: "A1", front: "учить", back: "to study / learn", example: "Мы учим русский язык.", topic: "study" },
  { id: "f-4", level: "A2", front: "выучить", back: "to learn completely", example: "Она выучила диалог.", topic: "study" },
  { id: "f-5", level: "A1", front: "словарь", back: "dictionary", example: "Я покупаю новый словарь.", topic: "study" },
  { id: "f-6", level: "A1", front: "билет", back: "ticket", example: "Он покупает билет.", topic: "city" },
  { id: "f-7", level: "A2", front: "врач", back: "doctor", example: "Я знаю хорошего врача.", topic: "work" },
  { id: "f-8", level: "A1", front: "яблоко", back: "apple", example: "Дети любят яблоки.", topic: "food" },
];

/** Compatibility alias for simple module-list consumers. */
export const modules = courseModules;

/** All verb exercises, ready for a dedicated practice screen. */
export const verbExercises = courseModules
  .filter((module) => module.id.startsWith("verbs-"))
  .flatMap((module) => module.exercises.map((exercise) => ({ ...exercise, moduleId: module.id })));

export type StudentProgress = {
  completedModuleIds: string[];
  correctAnswers: number;
  reviewedCardIds: string[];
  currentStreak: number;
};

export const studentProgress: StudentProgress = {
  completedModuleIds: ["acc-inanimate-singular"],
  correctAnswers: 2,
  reviewedCardIds: ["f-1", "f-2"],
  currentStreak: 3,
};
