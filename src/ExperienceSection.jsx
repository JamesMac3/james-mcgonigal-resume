// File: ExperienceSection.jsx
import React from 'react';
import { motion } from 'framer-motion';

export default function ExperienceSection({ experiences }) {
  return (
    <section id="experience" className="py-20 px-6 md:px-20 bg-gray-900 bg-opacity-80">
      <motion.h2
        className="text-4xl font-semibold mb-8 text-center text-white"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Experience
      </motion.h2>
      <div className="space-y-8 max-w-4xl mx-auto">
        {experiences.map((exp, idx) => (
          <motion.div
            key={idx}
            className="bg-gray-800 bg-opacity-70 p-6 rounded-lg hover:bg-opacity-80 transition"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 * idx, duration: 0.5 }}
          >
            <h3 className="text-2xl font-bold text-green-500">{exp.role}</h3>
            <p className="text-gray-400 italic">{exp.period}</p>
            <p className="text-gray-200 mt-2">
              {exp.description}{' '}
              <a
                href={exp.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-500 hover:underline"
              >
                {exp.linkLabel}
              </a>
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
