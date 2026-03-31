import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Brain, Bell, FileCheck, Sparkles } from 'lucide-react';
import PixelBlast from '../designs/homebg';
import Particles from '../designs/particle';

// Reusable fade-up animation variant
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: [0.25, 0.4, 0.25, 1] }
  })
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    transition: { duration: 0.8, delay, ease: 'easeOut' }
  })
};

const scaleUp = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, delay, ease: [0.25, 0.4, 0.25, 1] }
  })
};

const slideInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.25, 0.4, 0.25, 1] } }
};

const slideInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.25, 0.4, 0.25, 1] } }
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
  }
};

const cardItem = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }
  }
};

const listItem = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
};

export const HomeScreen: React.FC<{ onLaunch: () => void }> = ({ onLaunch }) => {
  return (
    <div className="relative overflow-hidden">

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center px-4 md:px-8">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: 0 }}
          src="https://res.cloudinary.com/dad2siqxd/video/upload/v1774816351/InShot_20251230_233754311_hx6gie.mp4"
        />

        <div className="absolute inset-0 bg-black/60" style={{ zIndex: 10 }} />

        <div className="relative max-w-6xl w-full text-center space-y-8" style={{ zIndex: 20 }}>
          <motion.h1
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.9, ease: [0.25, 0.4, 0.25, 1] }}
            className="text-3xl sm:text-5xl md:text-7xl font-extrabold leading-tight"
          >
            Intelligent Mine Safety
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="block text-orange-400"
            >
              Powered by  AI
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto px-2"
          >
            Transform DGMS accident records into actionable intelligence. Detect risks early, automate safety audits, and gain real-time insights across mining operations.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="flex justify-center gap-4 pt-4"
          >
            <button
              onClick={onLaunch}
              className="group relative px-6 md:px-8 py-3 md:py-4 rounded-xl bg-amber-600 text-white font-semibold flex items-center gap-3 shadow-lg hover:shadow-xl hover:scale-105 transition-all text-sm md:text-base"
            >
              Check Alerts
              <ArrowRight className="group-hover:translate-x-1 transition" />
              <span className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ ABOUT ═══════════════════ */}
      <section className="py-12 md:py-16 px-4 md:px-8 bg-black text-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">

          {/* Image Stack */}
          <motion.div
            className="relative h-[300px] sm:h-[400px] lg:h-[450px] mx-auto w-full max-w-[400px] lg:max-w-none"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.img
              variants={fadeUp}
              custom={0}
              src="https://res.cloudinary.com/dad2siqxd/image/upload/v1774815723/mineandtechnology_hkecuh.jpg"
              className="absolute w-44 h-60 sm:w-56 sm:h-72 lg:w-72 lg:h-96 object-cover rounded-2xl shadow-xl rotate-[-10deg] left-0 top-10"
            />
            <motion.img
              variants={fadeUp}
              custom={0.15}
              src="https://res.cloudinary.com/dad2siqxd/image/upload/v1774815723/mine1_jfm1so.jpg"
              className="absolute w-44 h-60 sm:w-56 sm:h-72 lg:w-72 lg:h-96 object-cover rounded-2xl shadow-xl rotate-[6deg] left-16 sm:left-20 lg:left-24 top-0"
            />
            <motion.img
              variants={fadeUp}
              custom={0.3}
              src="https://res.cloudinary.com/dad2siqxd/image/upload/v1774815723/mineai_qicn82.jpg"
              className="absolute w-44 h-60 sm:w-56 sm:h-72 lg:w-72 lg:h-96 object-cover rounded-2xl shadow-xl rotate-[14deg] left-32 sm:left-40 lg:left-48 top-12"
            />
          </motion.div>

          {/* Content */}
          <motion.div
            className="space-y-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.div variants={fadeUp} custom={0} className="inline-block px-4 py-1 border rounded-full text-sm font-semibold">
              ABOUT PLATFORM
            </motion.div>

            <motion.h2 variants={fadeUp} custom={0.1} className="text-2xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
              Transforming Mining Safety Through AI
            </motion.h2>

            <motion.p variants={fadeUp} custom={0.2} className="text-white-600 leading-relaxed">
              Mine Agent leverages DGMS accident records (2016–2022) and advanced NLP techniques to digitize, analyze, and extract critical safety insights. The platform enables faster decision-making, improved hazard detection, and proactive risk management.
            </motion.p>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-4"
            >
              <motion.div variants={cardItem} className="p-6 rounded-xl text-white bg-transparent border border-white/10 hover:border-white/20 transition-colors">
                <h4 className="font-bold text-lg mb-2">Our Vision</h4>
                <p className="text-sm text-white">
                  To create safer mines through intelligent, data-driven insights and automation.
                </p>
              </motion.div>

              <motion.div variants={cardItem} className="p-6 rounded-xl text-white bg-transparent border border-white/10 hover:border-white/20 transition-colors">
                <h4 className="font-bold text-lg mb-2">Our Mission</h4>
                <p className="text-sm text-white">
                  To reduce mining accidents by enabling predictive analysis and real-time safety monitoring.
                </p>
              </motion.div>
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* ═══════════════════ CORE CAPABILITIES ═══════════════════ */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-black">
        <motion.div
          className="max-w-6xl mx-auto text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          <motion.h2 variants={fadeUp} custom={0} className="text-2xl sm:text-4xl font-bold mb-4">Core Capabilities</motion.h2>
          <motion.p variants={fadeUp} custom={0.1} className="text-gray-400 max-w-2xl mx-auto">
            Built to digitize and analyze DGMS mining accident data using advanced AI techniques.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {[
            { Icon: Brain, title: 'NLP-Based Analysis', desc: 'Extract structured insights from hundreds of DGMS accident reports to uncover hidden risk patterns.' },
            { Icon: Bell, title: 'Real-Time Alerts', desc: 'Detect anomalies and generate instant alerts on emerging safety threats.' },
            { Icon: FileCheck, title: 'Automated Reports', desc: 'Generate detailed compliance and safety audit reports automatically.' },
            { Icon: Sparkles, title: 'Predictive Insights', desc: 'Forecast accident trends and recommend preventive safety measures.' }
          ].map((card) => (
            <motion.div
              key={card.title}
              variants={cardItem}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="p-6 md:p-8 rounded-2xl bg-white/5 border border-white/10 shadow-[0_0_30px_rgba(255,140,0,0.15)] hover:shadow-[0_0_40px_rgba(255,140,0,0.25)] transition-shadow"
            >
              <card.Icon className="mb-4 text-primary w-6 h-6" />
              <h3 className="text-xl font-bold mb-2">{card.title}</h3>
              <p className="text-gray-400 text-sm">{card.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ═══════════════════ AI SAFETY OFFICER ═══════════════════ */}
      <section className="py-16 md:py-32 px-4 md:px-8 bg-gradient-to-b from-transparent to-black/40">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">

          <motion.div
            className="space-y-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.h2 variants={fadeUp} custom={0} className="text-2xl sm:text-4xl font-bold">Your AI Safety Officer</motion.h2>
            <motion.p variants={fadeUp} custom={0.1} className="text-gray-400">
              Move beyond dashboards. Mine Agent acts as an intelligent assistant that understands, analyzes, and responds to mining safety data in real time.
            </motion.p>

            <motion.ul
              className="space-y-4 text-gray-300"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                'Ask questions like: "Methane accidents in 2021?"',
                'Get instant summaries and root-cause insights',
                'Receive actionable safety recommendations',
                'Continuous monitoring of DGMS and reports'
              ].map((text) => (
                <motion.li key={text} variants={listItem} className="flex items-start gap-3">
                  <span className="mt-1.5 w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                  {text}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          {/* Safety Image with Orange Glow */}
          <motion.div
            className="relative flex items-center justify-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={scaleUp}
            custom={0.2}
          >
            <div className="absolute inset-0 bg-orange-500/20 rounded-2xl blur-[60px]" />
            <motion.img
              src="https://res.cloudinary.com/dad2siqxd/image/upload/v1774815965/safety_sxbepd.jpg"
              className="relative w-full max-w-md rounded-2xl object-cover shadow-[0_0_60px_rgba(255,140,0,0.4)]"
              whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
            />
          </motion.div>

        </div>
      </section>

      {/* ═══════════════════ CTA ═══════════════════ */}
      <section className="relative py-16 md:py-24 px-4 md:px-8 text-center overflow-hidden">
        <div className="absolute inset-0" style={{ zIndex: 0 }}>
          <PixelBlast
            variant="square"
            pixelSize={4}
            color="#FF8C00"
            patternScale={2}
            patternDensity={1}
            pixelSizeJitter={0}
            enableRipples
            rippleSpeed={0.4}
            rippleThickness={0.12}
            rippleIntensityScale={1.5}
            liquid={false}
            liquidStrength={0.12}
            liquidRadius={1.2}
            liquidWobbleSpeed={5}
            speed={0.5}
            edgeFade={0.25}
            transparent
          />
        </div>
        <div className="absolute inset-0 bg-black/70" style={{ zIndex: 1 }} />

        <motion.div
          className="relative max-w-3xl mx-auto space-y-6"
          style={{ zIndex: 10 }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          <motion.h2 variants={fadeUp} custom={0} className="text-2xl sm:text-4xl font-bold">
            Start Exploring Mine Safety Intelligence
          </motion.h2>
          <motion.p variants={fadeUp} custom={0.15} className="text-gray-400">
            Unlock insights from historical mining accidents and enhance safety with AI-driven decisions.
          </motion.p>

          <motion.div variants={fadeUp} custom={0.3}>
            <button
              onClick={onLaunch}
              className="px-8 md:px-10 py-3 md:py-4 rounded-xl bg-orange-500 text-white font-semibold shadow-lg hover:scale-105 hover:shadow-[0_0_30px_rgba(255,140,0,0.3)] transition-all text-sm md:text-base"
            >
              Chat with AI Safety Officer
            </button>
          </motion.div>
        </motion.div>
      </section>

    </div>
  );
};
