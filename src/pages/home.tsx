import {
  BookOpen,
  Users,
  BarChart3,
  Sparkles,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { useState, useEffect } from "react";
import { Card } from "@/shared/components/card";
import { Link } from "@tanstack/react-router";
import { Button } from "@/shared/components/button";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const slideInLeftVariants: Variants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const slideInRightVariants: Variants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const floatVariants: Variants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 4,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative">
        <motion.div
          className="text-center space-y-6"
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <motion.h1
            className="text-5xl sm:text-7xl font-bold text-balance leading-tight"
            variants={itemVariants}
          >
            <span className="bg-gradient-to-r from-primary via-blue-950 to-primary bg-clip-text text-transparent">
              스마트하게 학습하다
            </span>
          </motion.h1>
          <motion.p
            className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            FlipNote와 함께 플래시카드로 효율적인 학습을 경험하세요. 친구들과
            함께 카드셋을 만들고, 공유하고, 함께 성장합니다.
          </motion.p>
          <motion.div
            className="flex gap-4 justify-center pt-4 flex-wrap"
            variants={itemVariants}
          >
            <Link to="/auth/register">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base group">
                무료로 시작하기
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button
              variant="outline"
              className="border-secondary text-primary px-8 py-6 text-base bg-transparent"
            >
              둘러보기
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute top-20 right-10 w-32 h-32 rounded-full bg-primary/10 blur-3xl pointer-events-none"
          animate="animate"
          variants={floatVariants}
        />
        <motion.div
          className="absolute bottom-40 left-10 w-40 h-40 rounded-full bg-accent/10 blur-3xl pointer-events-none"
          animate="animate"
          variants={{
            animate: {
              y: [0, 10, 0],
              transition: {
                duration: 5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              },
            },
          }}
        />
      </section>

      {/* Features Section - Alternating Left/Right */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-16">
        <motion.div
          className="grid lg:grid-cols-2 gap-12 items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {/* Left: Image/Visual */}
          <motion.div
            className="flex justify-center"
            variants={slideInLeftVariants}
          >
            <div className="relative">
              <motion.div className="w-80 h-80 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30" />
              <motion.div
                className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent to-primary/5"
                animate={{
                  boxShadow: [
                    "0 0 0 0 rgba(124, 107, 168, 0.3)",
                    "0 0 0 20px rgba(124, 107, 168, 0)",
                  ],
                }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              />
            </div>
          </motion.div>

          {/* Right: Content */}
          <motion.div className="space-y-6" variants={slideInRightVariants}>
            <h2 className="text-4xl font-bold">스마트 학습 모드</h2>
            <p className="text-muted-foreground text-lg">
              연습, 암기, 시험 모드로 다양한 방식의 학습을 경험하세요. 각 모드는
              당신의 학습 스타일에 맞게 설계되었습니다.
            </p>
            <ul className="space-y-3">
              {[
                "실시간 진행도 추적",
                "맞춤형 학습 경로",
                "상세한 오답 분석",
              ].map((item, idx) => (
                <motion.li
                  key={idx}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                >
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        {/* Feature 2: Collaboration - Right/Left */}
        <motion.div
          className="grid lg:grid-cols-2 gap-12 items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {/* Left: Content */}
          <motion.div
            className="space-y-6 lg:order-2"
            variants={slideInLeftVariants}
          >
            <h2 className="text-4xl font-bold">협업 학습</h2>
            <p className="text-muted-foreground text-lg">
              최대 6명까지 함께 카드셋을 만들고 편집하세요. 실시간으로 친구들과
              협력하며 더 효과적으로 학습합니다.
            </p>
            <ul className="space-y-3">
              {["실시간 협업 편집", "공유 카드셋 관리", "협력 학습 추적"].map(
                (item, idx) => (
                  <motion.li
                    key={idx}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span>{item}</span>
                  </motion.li>
                )
              )}
            </ul>
          </motion.div>

          {/* Right: Visual */}
          <motion.div
            className="flex justify-center lg:order-1"
            variants={slideInRightVariants}
          >
            <div className="relative">
              <motion.div className="w-80 h-80 rounded-2xl bg-gradient-to-br from-accent/20 to-primary/20 border border-accent/30" />
              <motion.div
                className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent to-accent/5"
                animate={{
                  boxShadow: [
                    "0 0 0 0 rgba(168, 184, 255, 0.3)",
                    "0 0 0 20px rgba(168, 184, 255, 0)",
                  ],
                }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Benefits Grid Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          className="text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.h2
            className="text-4xl font-bold mb-4"
            variants={itemVariants}
          >
            FlipNote를 선택하는 이유
          </motion.h2>
          <motion.p
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
            variants={itemVariants}
          >
            최고의 학습 경험을 제공하기 위해 설계된 플랫폼
          </motion.p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {[
            {
              icon: BookOpen,
              title: "스마트 학습",
              description:
                "연습, 암기, 시험 모드로 다양한 방식으로 학습합니다.",
            },
            {
              icon: Users,
              title: "협업 편집",
              description: "최대 6명까지 함께 카드셋을 만들 수 있습니다.",
            },
            {
              icon: BarChart3,
              title: "학습 분석",
              description: "오답노트와 진행도로 학습 상황을 파악합니다.",
            },
            {
              icon: Sparkles,
              title: "그룹 학습",
              description: "그룹을 만들어 함께 학습하고 성장합니다.",
            },
          ].map((feature, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              <Card className="p-6 border-secondary/50 hover:border-accent/50 hover:shadow-lg transition-all group h-full cursor-pointer">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-8 h-8 text-primary mb-4 group-hover:text-accent transition-colors"
                >
                  <feature.icon className="w-full h-full" />
                </motion.div>
                <h3 className="font-semibold text-base mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={itemVariants}
        >
          <Card className="p-12 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 border-secondary/50 relative overflow-hidden">
            <motion.div
              className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/10 blur-3xl"
              animate={{
                x: [0, 20, 0],
                y: [0, -20, 0],
              }}
              transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY }}
              style={{ pointerEvents: "none" }}
            />

            <motion.div
              className="relative text-center space-y-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className="text-3xl font-bold">지금 바로 시작하세요</h3>
              <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                회원가입은 무료이며, 언제든지 더 많은 카드셋을 만들고 친구들과
                공유할 수 있습니다.
              </p>
              <Link to="/auth/register">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base group">
                  무료 가입하기
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </Card>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-secondary/30 mt-16 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-primary">FlipNote</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 FlipNote. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
