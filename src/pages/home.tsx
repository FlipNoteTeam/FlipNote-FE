import {
  BookOpen,
  Users,
  BarChart3,
  Sparkles,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  RotateCcw,
} from "lucide-react";
import { motion, type Variants, useReducedMotion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/shared/components/button";

// ─────────────────────────────────────────────
// Flip Card Demo (Hero Visual)
// ─────────────────────────────────────────────
function FlipCardDemo() {
  const shouldReduce = useReducedMotion();
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (shouldReduce) return;
    const t = setInterval(() => setFlipped((p) => !p), 3000);
    return () => clearInterval(t);
  }, [shouldReduce]);

  const float = (dir: 1 | -1, delay = 0) =>
    shouldReduce
      ? {}
      : {
          animate: { y: [0, dir * 7, 0] },
          transition: {
            duration: 4 + delay,
            repeat: Infinity,
            ease: "easeInOut",
            delay,
          },
        };

  return (
    <div className="relative flex items-center justify-center min-h-[360px]">
      {/* Background gradient */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50/60 to-white pointer-events-none" />
      {/* Floating glass card — top right */}
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-expect-error */}
      <motion.div
        className="absolute top-6 right-4 sm:right-10 w-48 h-24 rounded-2xl border border-white/70 shadow-md flex flex-col items-center justify-center gap-1 p-4"
        style={{
          backdropFilter: "blur(16px)",
          background: "rgba(255,255,255,0.78)",
        }}
        {...float(1)}
      >
        <CheckCircle className="w-4 h-4 text-green-500" />
        <div className="text-sm font-bold text-foreground tracking-tight">
          Resilience
        </div>
        <div className="text-[10px] text-muted-foreground">
          회복력 · 복습 완료
        </div>
      </motion.div>
      {/* Floating glass card — bottom left */}
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-expect-error */}
      <motion.div
        className="absolute bottom-6 left-4 sm:left-10 w-44 h-22 rounded-2xl border border-white/70 shadow-md flex flex-col items-center justify-center gap-1.5 p-3"
        style={{
          backdropFilter: "blur(16px)",
          background: "rgba(255,255,255,0.78)",
        }}
        {...float(-1, 0.8)}
      >
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`w-2.5 h-1 rounded-full ${i <= 4 ? "bg-primary" : "bg-gray-200"}`}
            />
          ))}
        </div>
        <div className="text-xs font-semibold text-foreground">
          오늘 4 / 5 완료
        </div>
        <div className="text-[10px] text-muted-foreground">
          연속 7일 학습 중
        </div>
      </motion.div>
      {/* Main flip card */}
      <div
        className="w-72 h-44 cursor-pointer select-none z-10"
        style={{ perspective: "1200px" }}
        onClick={() => setFlipped((p) => !p)}
        role="button"
        tabIndex={0}
        aria-label="플립카드 뒤집기"
        onKeyDown={(e) =>
          (e.key === "Enter" || e.key === " ") && setFlipped((p) => !p)
        }
      >
        <motion.div
          style={{
            transformStyle: "preserve-3d",
            width: "100%",
            height: "100%",
            position: "relative",
          }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={
            shouldReduce
              ? { duration: 0 }
              : { duration: 0.65, ease: [0.23, 1, 0.32, 1] }
          }
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-3xl bg-white border border-gray-200 shadow-2xl flex flex-col items-center justify-center gap-2 px-8"
            style={{ backfaceVisibility: "hidden" }}
          >
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em]">
              Q. 뜻을 맞춰보세요
            </span>
            <span className="text-3xl font-bold text-foreground tracking-tight">
              Serendipity
            </span>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
              <RotateCcw className="w-3 h-3" />
              탭하여 답 확인
            </div>
          </div>
          {/* Back */}
          <div
            className="absolute inset-0 rounded-3xl bg-primary shadow-2xl flex flex-col items-center justify-center gap-2 px-8"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <span className="text-[10px] font-semibold text-primary-foreground/60 uppercase tracking-[0.2em]">
              A. 정답
            </span>
            <span className="text-3xl font-bold text-primary-foreground tracking-tight">
              뜻밖의 행운
            </span>
            <div className="flex gap-2 mt-1">
              <span className="text-[10px] px-3 py-1 bg-white/20 rounded-full text-primary-foreground">
                영어
              </span>
              <span className="text-[10px] px-3 py-1 bg-white/20 rounded-full text-primary-foreground">
                TOEIC
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Home Page
// ─────────────────────────────────────────────
export default function Home() {
  const shouldReduce = useReducedMotion();

  const fadeUp = (delay = 0): Variants => ({
    hidden: { opacity: 0, y: shouldReduce ? 0 : 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduce ? 0 : 0.55,
        delay: shouldReduce ? 0 : delay,
        ease: "easeOut",
      },
    },
  });

  const stagger: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduce ? 0 : 0.1,
        delayChildren: shouldReduce ? 0 : 0.1,
      },
    },
  };

  return (
    <div className="min-h-screen">
      {/* ── HERO ── */}
      <section className="relative py-16 sm:py-24 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[480px] h-[480px] rounded-full bg-primary/6 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -left-20 w-64 h-64 rounded-full bg-indigo-100/50 blur-3xl pointer-events-none" />

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center relative">
          {/* Left: Copy */}
          <motion.div
            className="space-y-6"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <motion.div variants={fadeUp(0)}>
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                <Sparkles className="w-3 h-3" />
                플래시카드 기반 학습 플랫폼
              </span>
            </motion.div>

            <motion.h1
              className="text-5xl sm:text-[3.75rem] font-bold leading-[1.08] tracking-tight"
              variants={fadeUp(0.05)}
            >
              암기가
              <br />
              <span className="text-primary">달라집니다</span>
            </motion.h1>

            <motion.p
              className="text-lg text-muted-foreground leading-relaxed max-w-md"
              variants={fadeUp(0.1)}
            >
              플래시카드를 만들고, 친구와 함께 편집하고, 원하는 방식으로
              학습하세요. FlipNote와 함께라면 공부가 달라집니다.
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-3 pt-1"
              variants={fadeUp(0.15)}
            >
              <Link to="/auth/register">
                <Button className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 px-7 h-12 text-base rounded-xl font-semibold group transition-all duration-200 shadow-sm">
                  무료로 시작하기
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              </Link>
              <Button
                variant="outline"
                className="cursor-pointer border-gray-200 text-foreground px-7 h-12 text-base rounded-xl font-semibold bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                기능 살펴보기
              </Button>
            </motion.div>

            <motion.div
              className="flex flex-wrap items-center gap-5"
              variants={fadeUp(0.2)}
            >
              {["무료 가입", "실시간 협업", "오답 자동 분석"].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground"
                >
                  <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                  {item}
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Flip card demo */}
          <motion.div
            initial={shouldReduce ? {} : { opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.15, ease: "easeOut" }}
          >
            <FlipCardDemo />
          </motion.div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="border-t border-b border-gray-100 py-10">
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { value: "3가지", label: "학습 모드" },
            { value: "6인", label: "실시간 협업" },
            { value: "무제한", label: "카드셋 생성" },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={shouldReduce ? {} : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.45, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <div className="text-3xl sm:text-4xl font-bold text-primary">
                {s.value}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── BENTO FEATURES ── */}
      <section className="py-24">
        <motion.div
          className="text-center mb-14"
          initial={shouldReduce ? {} : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold tracking-tight mb-3">
            FlipNote의 모든 것
          </h2>
          <p className="text-muted-foreground text-lg">
            효율적인 학습을 위한 모든 기능이 담겨 있어요
          </p>
        </motion.div>

        {/* Bento Grid: 4-col, Apple-style */}
        <div
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
          style={{ gridAutoRows: "minmax(0, auto)" }}
        >
          {/* ① 스마트 학습 모드 — Large 2×2 */}
          <motion.div
            className="md:col-span-2 md:row-span-2 rounded-3xl bg-white border border-gray-100 p-7 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/5 hover:scale-[1.015] transition-all duration-200 cursor-pointer group"
            initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            viewport={{ once: true, margin: "-40px" }}
          >
            <div className="flex items-start justify-between mb-5">
              <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors duration-200">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <span className="text-[10px] font-bold tracking-widest text-muted-foreground bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">
                3 MODES
              </span>
            </div>
            <h3 className="text-xl font-bold tracking-tight mb-2">
              스마트 학습 모드
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              연습, 암기, 시험 세 가지 모드로 자신에게 맞는 방식을 골라
              학습하세요.
            </p>
            <div className="space-y-2.5">
              {[
                {
                  label: "연습하기",
                  desc: "자유롭게 카드 넘기기",
                  selected: false,
                },
                {
                  label: "암기하기",
                  desc: "간격 반복 학습법 적용",
                  selected: true,
                },
                {
                  label: "시험 보기",
                  desc: "실전 테스트 모드",
                  selected: false,
                },
              ].map((m) => (
                <div
                  key={m.label}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors duration-200 ${
                    m.selected
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-gray-50 text-muted-foreground border-gray-100"
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      m.selected ? "bg-primary-foreground/80" : "bg-gray-300"
                    }`}
                  />
                  <div>
                    <div className="font-semibold">{m.label}</div>
                    <div
                      className={`text-[11px] mt-0.5 ${
                        m.selected
                          ? "text-primary-foreground/65"
                          : "text-muted-foreground/70"
                      }`}
                    >
                      {m.desc}
                    </div>
                  </div>
                  {m.selected && (
                    <span className="ml-auto text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-medium">
                      선택됨
                    </span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* ② 실시간 협업 — Medium 2×1 */}
          <motion.div
            className="md:col-span-2 rounded-3xl bg-white border border-gray-100 p-7 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/5 hover:scale-[1.015] transition-all duration-200 cursor-pointer group"
            initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: shouldReduce ? 0 : 0.07,
              ease: "easeOut",
            }}
            viewport={{ once: true, margin: "-40px" }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors duration-200">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                LIVE
              </div>
            </div>
            <h3 className="text-lg font-bold tracking-tight mb-1.5">
              실시간 협업 편집
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              최대 6명이 동시에 하나의 카드셋을 만들고 편집합니다.
            </p>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2.5">
                {(["#6366f1", "#f59e0b", "#10b981", "#ef4444"] as const).map(
                  (color, i) => (
                    <div
                      key={i}
                      className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: color }}
                    >
                      {["K", "J", "L", "M"][i]}
                    </div>
                  ),
                )}
              </div>
              <span className="text-sm text-muted-foreground">
                4명 함께 편집 중
              </span>
            </div>
          </motion.div>

          {/* ③ 오답노트 — Small 1×1 */}
          <motion.div
            className="md:col-span-1 rounded-3xl bg-white border border-gray-100 p-6 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/5 hover:scale-[1.015] transition-all duration-200 cursor-pointer group"
            initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: shouldReduce ? 0 : 0.12,
              ease: "easeOut",
            }}
            viewport={{ once: true, margin: "-40px" }}
          >
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors duration-200">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-base font-bold tracking-tight mb-1.5">
              오답노트
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-5">
              틀린 카드를 자동으로 추려 약점을 집중 복습하세요.
            </p>
            <div className="space-y-2.5">
              {[
                { label: "정답률", value: 82 },
                { label: "오늘 진행", value: 60 },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="flex justify-between text-[11px] mb-1.5">
                    <span className="text-muted-foreground">{stat.label}</span>
                    <span className="font-semibold text-foreground">
                      {stat.value}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${stat.value}%` }}
                      transition={{
                        duration: shouldReduce ? 0 : 0.9,
                        ease: "easeOut",
                        delay: 0.2,
                      }}
                      viewport={{ once: true }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ④ 학습 통계 — Small 1×1 (primary color) */}
          <motion.div
            className="md:col-span-1 rounded-3xl bg-primary p-6 hover:shadow-xl hover:shadow-primary/25 hover:scale-[1.015] transition-all duration-200 cursor-pointer group"
            initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: shouldReduce ? 0 : 0.17,
              ease: "easeOut",
            }}
            viewport={{ once: true, margin: "-40px" }}
          >
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <h3 className="text-base font-bold tracking-tight mb-1.5 text-primary-foreground">
              학습 통계
            </h3>
            <p className="text-xs text-primary-foreground/65 leading-relaxed mb-5">
              진행도와 성취를 한눈에 파악하세요.
            </p>
            <div className="flex items-end gap-1 h-10">
              {[40, 65, 50, 80, 60, 90, 75].map((h, i) => (
                <motion.div
                  key={i}
                  className="flex-1 bg-white/30 rounded-sm"
                  style={{ height: `${h}%` }}
                  initial={shouldReduce ? {} : { scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  transition={{
                    duration: shouldReduce ? 0 : 0.5,
                    delay: i * 0.06,
                    ease: "easeOut",
                  }}
                  viewport={{ once: true }}
                />
              ))}
            </div>
          </motion.div>

          {/* ⑤ 그룹 학습 — Full width 4×1 */}
          <motion.div
            className="md:col-span-4 rounded-3xl bg-gray-50 border border-gray-100 p-7 hover:border-primary/20 hover:shadow-md hover:scale-[1.005] transition-all duration-200 cursor-pointer group"
            initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: shouldReduce ? 0 : 0.08,
              ease: "easeOut",
            }}
            viewport={{ once: true, margin: "-40px" }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors duration-200">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight mb-1">
                    그룹 학습 & 공유
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    그룹을 만들어 카드셋을 공유하고 함께 성장하는 학습
                    커뮤니티를 경험하세요.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                {["영어 스터디", "TOEIC 900", "의대 국시"].map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-full text-foreground font-medium shadow-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 border-t border-gray-100">
        <motion.div
          className="text-center mb-14"
          initial={shouldReduce ? {} : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold tracking-tight mb-3">
            시작하는 방법
          </h2>
          <p className="text-muted-foreground text-lg">
            3단계로 바로 시작할 수 있어요
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-10">
          {[
            {
              num: "01",
              icon: BookOpen,
              title: "카드셋 만들기",
              desc: "주제별 플래시카드를 직접 만들거나, 공개된 카드셋을 가져와 바로 학습을 시작하세요.",
            },
            {
              num: "02",
              icon: Users,
              title: "친구와 함께하기",
              desc: "그룹을 만들어 카드셋을 공유하거나, 최대 6명이 실시간으로 함께 카드를 만들어요.",
            },
            {
              num: "03",
              icon: TrendingUp,
              title: "실력 키우기",
              desc: "연습, 암기, 시험 모드로 반복 학습하고, 오답노트로 약점을 집중 공략하세요.",
            },
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                delay: shouldReduce ? 0 : i * 0.1,
                duration: 0.5,
                ease: "easeOut",
              }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-5">
                <span className="text-5xl font-black text-primary/10 leading-none select-none">
                  {step.num}
                </span>
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <step.icon className="w-5 h-5 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-bold mb-2 tracking-tight">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16">
        <motion.div
          className="relative overflow-hidden rounded-3xl bg-primary px-8 py-20 text-center"
          initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          {/* Dot pattern */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary-foreground/70 bg-white/10 px-3 py-1.5 rounded-full border border-white/20 mb-6">
              <Sparkles className="w-3 h-3" />
              무료로 시작하세요
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-primary-foreground mb-4 tracking-tight">
              지금 바로 시작하세요
            </h2>
            <p className="text-primary-foreground/70 text-lg mb-8 max-w-md mx-auto leading-relaxed">
              회원가입은 무료이며, 오늘부터 더 스마트하게 공부하세요.
            </p>
            <Link to="/auth/register">
              <Button className="cursor-pointer bg-white text-primary hover:bg-white/90 px-8 h-14 text-base font-semibold rounded-xl group shadow-lg transition-all duration-200">
                무료 가입하기
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-100 py-8">
        <div className="flex justify-between items-center flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">FlipNote</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 FlipNote. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
