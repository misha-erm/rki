import type { Metadata } from "next";
import LearningApp from "./learning-app";

export const metadata: Metadata = {
  title: "Русский для жизни",
  description: "Интерактивная платформа для изучения русского языка.",
};

export default function Home() {
  return <LearningApp />;
}
