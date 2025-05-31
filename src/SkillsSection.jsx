// File: SkillsSection.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function SkillsSection({ skills, explanations }) {
  const [expanded, setExpanded] = useState(null);
  const toggle = (skill) => setExpanded(prev => (prev === skill ? null : skill));

  return (
    <section id="skills" className="py-20 px-6 md:px-20">
      <motion.h2
        className="text-4xl font-semibold mb-8 text-center text-white"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Skills & Technologies
      </motion.h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {skills.map((skill, idx) => {
          const isOpen = expanded === skill;
          return (
            <div
              key={idx}
              className="bg-gray-800 bg-opacity-70 rounded-lg overflow-hidden shadow-lg"
            >
              <button
                onClick={() => toggle(skill)}
                className="w-full text-left p-4 focus:outline-none flex justify-between items-center"
              >
                <span className="text-gray-200 text-lg">{skill}</span>
                <span className={`text-green-500 transition-transform transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {isOpen && (
                <motion.div
                  className="bg-gray-700 bg-opacity-60 px-4 pb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-gray-300 text-sm">{explanations[skill]}</p>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
