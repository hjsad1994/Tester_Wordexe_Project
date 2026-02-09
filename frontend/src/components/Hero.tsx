'use client';

import { useEffect, useRef } from 'react';
import { SparkleIcon, CloudIcon, ArrowRightIcon, PlayIcon } from './icons';
import {
  BottleIllustration,
  TeddyIllustration,
  ClothesIllustration,
  BowIllustration,
  PacifierIllustration,
  RattleIllustration,
} from './icons/ProductIllustrations';

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = (clientX / innerWidth - 0.5) * 20;
      const y = (clientY / innerHeight - 0.5) * 20;

      const floatingElements = heroRef.current.querySelectorAll('.parallax');
      floatingElements.forEach((el) => {
        const speed = parseFloat((el as HTMLElement).dataset.speed || '1');
        (el as HTMLElement).style.transform = `translate(${x * speed}px, ${y * speed}px)`;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-[90vh] overflow-hidden gradient-hero animate-gradient"
    >
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Clouds */}
        <div
          className="parallax absolute top-20 left-10 text-white/30 animate-float-slow"
          data-speed="2"
        >
          <CloudIcon size={120} />
        </div>
        <div
          className="parallax absolute top-40 right-20 text-white/20 animate-float-reverse"
          data-speed="1.5"
        >
          <CloudIcon size={80} />
        </div>
        <div
          className="parallax absolute bottom-40 left-1/4 text-white/25 animate-float"
          data-speed="1"
        >
          <CloudIcon size={100} />
        </div>

        {/* Sparkles */}
        <div
          className="parallax absolute top-32 left-1/3 text-pink-300 animate-sparkle"
          data-speed="3"
        >
          <SparkleIcon size={32} />
        </div>
        <div
          className="parallax absolute top-60 right-1/4 text-purple-300 animate-sparkle delay-300"
          data-speed="2"
        >
          <SparkleIcon size={24} />
        </div>
        <div
          className="parallax absolute bottom-60 right-1/3 text-pink-400 animate-sparkle delay-500"
          data-speed="2.5"
        >
          <SparkleIcon size={28} />
        </div>
        <div
          className="parallax absolute top-1/2 left-20 text-blue-300 animate-sparkle delay-700"
          data-speed="1.5"
        >
          <SparkleIcon size={20} />
        </div>

        {/* Gradient Blobs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-pink-300/30 rounded-full blur-3xl blob-animate"></div>
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl blob-animate"
          style={{ animationDelay: '2s' }}
        ></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-200/20 rounded-full blur-3xl"></div>

        {/* Decorative Circles */}
        <div className="absolute top-20 right-1/4 w-4 h-4 bg-pink-400 rounded-full animate-bounce-soft"></div>
        <div className="absolute bottom-32 left-1/3 w-3 h-3 bg-purple-400 rounded-full animate-bounce-soft delay-200"></div>
        <div className="absolute top-1/3 left-16 w-2 h-2 bg-pink-300 rounded-full animate-bounce-soft delay-400"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
          {/* Text Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm text-pink-600 font-medium text-sm mb-8 animate-fade-in-up shadow-lg">
              <BowIllustration size={24} />
              <span>Bộ sưu tập Xuân 2026</span>
              <SparkleIcon size={16} className="text-amber-400 animate-sparkle" />
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-[var(--text-primary)] mb-6 leading-tight animate-fade-in-up delay-100">
              Trao yêu thương
              <br />
              <span className="text-gradient relative">
                cho bé yêu
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                  <path
                    d="M2 8 Q 50 2, 100 8 T 198 8"
                    stroke="url(#underline-gradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="animate-draw"
                  />
                  <defs>
                    <linearGradient id="underline-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f472b6" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg sm:text-xl text-[var(--text-secondary)] mb-10 max-w-xl mx-auto lg:mx-0 animate-fade-in-up delay-200 leading-relaxed">
              Khám phá bộ sưu tập đồ dùng cho bé với chất liệu an toàn, thiết kế xinh xắn, đem lại
              niềm vui và sự thoải mái cho thiên thần nhỏ của bạn.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up delay-300">
              <button className="btn-primary group flex items-center justify-center gap-3">
                <span>Mua sắm ngay</span>
                <ArrowRightIcon
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
              <button className="btn-secondary group flex items-center justify-center gap-3">
                <PlayIcon size={20} className="group-hover:scale-110 transition-transform" />
                <span>Xem video giới thiệu</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-8 mt-12 justify-center lg:justify-start animate-fade-in-up delay-400">
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-500">50K+</div>
                <div className="text-sm text-[var(--text-muted)]">Khách hàng</div>
              </div>
              <div className="w-px h-12 bg-pink-200"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-500">4.9</div>
                <div className="text-sm text-[var(--text-muted)]">Đánh giá</div>
              </div>
              <div className="w-px h-12 bg-pink-200"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-500">100%</div>
                <div className="text-sm text-[var(--text-muted)]">An toàn</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative flex items-center justify-center animate-fade-in-scale delay-200">
            {/* Background Circle */}
            <div className="absolute w-[400px] h-[400px] lg:w-[500px] lg:h-[500px] bg-gradient-to-br from-pink-200/60 to-purple-200/60 rounded-full blur-sm"></div>

            {/* Main Image Container */}
            <div className="relative z-10 w-[350px] h-[350px] lg:w-[450px] lg:h-[450px] rounded-full bg-gradient-to-br from-pink-100 to-white shadow-2xl flex items-center justify-center overflow-hidden group">
              {/* Central Baby Illustration */}
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="relative animate-float-slow">
                  <svg viewBox="0 0 200 200" className="w-64 h-64 lg:w-80 lg:h-80">
                    {/* Baby Face */}
                    <circle cx="100" cy="90" r="60" fill="#fce7f3" />
                    <circle cx="100" cy="90" r="50" fill="#fbcfe8" />

                    {/* Eyes */}
                    <circle cx="80" cy="85" r="8" fill="#4a3642" />
                    <circle cx="120" cy="85" r="8" fill="#4a3642" />
                    <circle cx="82" cy="83" r="3" fill="white" />
                    <circle cx="122" cy="83" r="3" fill="white" />

                    {/* Blush */}
                    <ellipse cx="65" cy="95" rx="8" ry="5" fill="#f9a8d4" opacity="0.6" />
                    <ellipse cx="135" cy="95" rx="8" ry="5" fill="#f9a8d4" opacity="0.6" />

                    {/* Smile */}
                    <path
                      d="M85 105 Q100 120 115 105"
                      stroke="#4a3642"
                      strokeWidth="3"
                      strokeLinecap="round"
                      fill="none"
                    />

                    {/* Hair/Bow */}
                    <circle cx="60" cy="50" r="12" fill="#f472b6" />
                    <circle cx="140" cy="50" r="12" fill="#f472b6" />
                    <path
                      d="M70 45 Q100 30 130 45"
                      stroke="#f472b6"
                      strokeWidth="8"
                      strokeLinecap="round"
                      fill="none"
                    />

                    {/* Body/Onesie */}
                    <ellipse cx="100" cy="170" rx="45" ry="35" fill="#fce7f3" />
                    <path
                      d="M70 155 L55 180"
                      stroke="#f9a8d4"
                      strokeWidth="6"
                      strokeLinecap="round"
                    />
                    <path
                      d="M130 155 L145 180"
                      stroke="#f9a8d4"
                      strokeWidth="6"
                      strokeLinecap="round"
                    />

                    {/* Heart on onesie */}
                    <path
                      d="M100 165 L95 160 Q90 155 95 150 Q100 145 100 150 Q100 145 105 150 Q110 155 105 160 Z"
                      fill="#f472b6"
                    />
                  </svg>
                </div>

                {/* Floating Products - Using SVG Illustrations */}
                <div
                  className="absolute top-8 right-8 animate-float"
                  style={{ animationDelay: '0.5s' }}
                >
                  <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center p-2">
                    <BottleIllustration size={60} />
                  </div>
                </div>
                <div
                  className="absolute bottom-16 left-4 animate-float-reverse"
                  style={{ animationDelay: '1s' }}
                >
                  <div className="w-18 h-18 bg-white rounded-2xl shadow-lg flex items-center justify-center p-2">
                    <TeddyIllustration size={55} />
                  </div>
                </div>
                <div
                  className="absolute top-1/4 left-4 animate-float"
                  style={{ animationDelay: '1.5s' }}
                >
                  <div className="w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center p-2">
                    <ClothesIllustration size={48} />
                  </div>
                </div>
                <div
                  className="absolute bottom-8 right-12 animate-float-reverse"
                  style={{ animationDelay: '0.8s' }}
                >
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center p-2">
                    <PacifierIllustration size={48} />
                  </div>
                </div>
                <div
                  className="absolute top-1/2 right-2 animate-float"
                  style={{ animationDelay: '1.2s' }}
                >
                  <div className="w-14 h-14 bg-white rounded-xl shadow-lg flex items-center justify-center p-1">
                    <RattleIllustration size={44} />
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Ring */}
            <div
              className="absolute w-[420px] h-[420px] lg:w-[520px] lg:h-[520px] border-2 border-dashed border-pink-200/50 rounded-full animate-spin"
              style={{ animationDuration: '30s' }}
            ></div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" className="w-full">
          <path
            d="M0 60C240 100 480 20 720 60C960 100 1200 20 1440 60V120H0V60Z"
            fill="var(--warm-white)"
          />
        </svg>
      </div>

      {/* Add draw animation */}
      <style jsx>{`
        @keyframes draw {
          from {
            stroke-dasharray: 300;
            stroke-dashoffset: 300;
          }
          to {
            stroke-dasharray: 300;
            stroke-dashoffset: 0;
          }
        }
        .animate-draw {
          animation: draw 1.5s ease-out forwards;
          animation-delay: 0.5s;
        }
      `}</style>
    </section>
  );
}
