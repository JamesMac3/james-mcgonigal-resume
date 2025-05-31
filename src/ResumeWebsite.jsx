// File: ResumeWebsite.jsx
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import ContactPopup from './ContactPopup';
import SkillsSection from './SkillsSection';
import ExperienceSection from './ExperienceSection';
import SpinningCubeBackground from './SpinningCubeBackground';

// *** STEP 1: Replace this with your actual Apps Script Web App URL ***
const GOOGLE_SHEET_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbzxPYNZ1zBkcSeDHuZk0w8tLBi6Byiwv-fYGWcQzjcY8Vkhxc7ZkrMZplyJz2MokD4y7A/exec";

const bio = `Air Force Veteran and Senior IT Manager with 10+ years Experience. 
Currently partner and CTO at Quantify, leading automated infrastructure, cybersecurity upgrades, and high-tech Web3 solutions. 
Passionate about AI, UI/UX design, customer interaction and Automation. Proven leader in enterprise IT modernization, training teams, and designing secure systems.`;

const skills = [
  'PowerShell & Remote Administration',
  'Active Directory & SharePoint',
  'Cybersecurity & Patch Compliance',
  'Agile DevOps & Automation',
  'Project Management & Leadership',
  'Web3 Integration & Smart Contracts',
  'React, javascript, Tailwind CSS',
  'People & Customer Interaction',
];

const skillExplanations = {
  'PowerShell & Remote Administration': 'Expertise in scripting automation and remote server management using PowerShell, enabling efficient infrastructure deployment and maintenance.',
  'Active Directory & SharePoint': 'Proficient in configuring, managing, and securing Active Directory environments and SharePoint portals for enterprise collaboration.',
  'Cybersecurity & Patch Compliance': 'Hands-on experience implementing security hardening, patch management, and STIG (Security Technical Implementation Guide) compliance to protect critical systems.',
  'Agile DevOps & Automation': 'Skilled in Agile methodologies, CI/CD pipelines, and infrastructure as code to accelerate development and deployment cycles.',
  'Project Management & Leadership': 'Demonstrated leadership in planning, executing, and delivering large-scale IT projects on time and within budget.',
  'Web3 Integration & Smart Contracts': 'Knowledgeable in blockchain architecture, writing and auditing smart contracts, and integrating decentralized applications.',
  'React, javascript, Tailwind CSS': 'Front-end expertise building interactive interfaces and 3D visualizations using React ecosystem and Tailwind styling. This website was built with React and Tailwind CSS.',
  'People & Customer Interaction': 'Strong interpersonal skills with a focus on customer satisfaction, team collaboration, and effective communication in high-pressure environments.',
};

const experiences = [
  {
    role: 'CTO – Quantify',
    period: 'Jun 2024 – Present',
    description: 'Current partner in the development of an algorithm-driven portfolio platform, managed DevOps pipelines, and led Web3 tokenization efforts.',
    linkLabel: 'Quantify Algorithmic Trading',
    linkUrl: 'https://www.quantify.bot',
  },
  {
    role: 'Cyber Defense Operations NCOIC – USAF (Osan AB, Korea)',
    period: 'Feb 2021 – Jul 2024',
    description: 'As the Non-commissioned officer in charge of the Cyber Defense Operations Department for the 731st Air Mobility Squadron (the tip of spear in the Pacific), I directed $460K in IT modernization projects, resolved over 3700 support tickets, and secured networks for 135 users. Led a $140K modernization upgrade in one week, coordinated all federal contractors, and invented a SharePoint ticketing system.',
    linkLabel: '731st Squadron Details',
    linkUrl: 'https://www.dafhistory.af.mil/About-Us/Fact-Sheets/Display/Article/433456/731-air-mobility-squadron-amc/',
  },
  {
    role: 'Special Projects Technician – RAF Lakenheath, UK',
    period: '2019 – 2021',
    description: 'Configured 3000+ VoIP phones using Cisco Unified Communications Manager, implemented STIG security guides on hundreds of warfighting systems, scripted automation tools, led a cloud migration of base printers, and supported F-35 infrastructure. Awarded Airman of the Month.',
    linkLabel: '48th Communications Squadron Details',
    linkUrl: 'https://www.lakenheath.af.mil/News/Article-Display/Article/2645407/48th-cs-wins-best-small-cs-in-usaf/',
  },
  {
    role: 'Client Systems Technician – Incirlik AB, Turkey',
    period: '2018 – 2019',
    description: 'Migrated 1300 Outlook users to cloud, deployed emergency office setups for critical investigations, participated in nuclear operations support, and supported long-range drone operations.',
    linkLabel: '39th Communications Squadron Details',
    linkUrl: 'https://www.incirlik.af.mil/About-Us/Fact-Sheets/Display/Article/300825/39th-communications-squadron/',
  },
  {
    role: 'IT Front Desk – Pueblo West High School, Pueblo West CO',
    period: '2009 – 2011',
    description: 'Foundational experience in IT support: initial diagnosis, managing front desk operations, ticket processing, and assisting with technical issues for students and staff.',
    linkLabel: 'Pueblo West HS Details',
    linkUrl: 'https://www.chieftain.com/story/news/2008/08/15/district-70-students-say-hi/8522808007/',
  },
];

const certifications = [
  'Secret Security Clearance (Active)',
  'CompTIA Security+ (Active)',
  'CompTIA Pentest+ (In Progress)',
  'CCNA Bootcamp',
  'IT Management — CCAF',
];

const interests = [
  'AI Development & Machine Learning',
  'Game Development & VR',
  'UI/UX Design',
  'Lockpicking & Physical Security',
  'White Hat Hacking',
  'Roadbike Riding & Fitness',
  '3D Printing & Prototyping',
  'Digital Art & 3D Modeling',
  'Dry Red Wines & Smooth/Peppery Cigars',
];

const contact = {
  email: 'Admin@JamesMcGonigal.com',
  linkedIn: 'https://www.linkedin.com/in/quantify',
};

export default function ResumeWebsite() {
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', phone: '', company: '', reason: '' });

  const openContact = () => setShowContactPopup(true);
  const closeContact = () => setShowContactPopup(false);
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };
  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log('Contact Form Submitted:', contactForm);
    closeContact();
  };

  return (
    <div className="relative">
      {/* 3D Wireframe Cube Background */}
      <SpinningCubeBackground />

      <Helmet>
        <title>James McGonigal — Cybertech Resume</title>
        <meta name="description" content="James McGonigal's resume. Ex-military CTO, Web3 innovator, and cybersecurity expert." />
        <meta name="keywords" content="James McGonigal, CTO, Cybersecurity, Web3, React, Tailwind CSS, Resume" />
        <meta name="author" content="James McGonigal" />
      </Helmet>

      {/* Content Overlay */}
      <div className="bg-black bg-opacity-70 relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex flex-col justify-center items-center text-center px-6">
          <motion.h1
            className="text-6xl md:text-8xl font-bold mb-4 text-white"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            James McGonigal
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-gray-300 max-w-2xl"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            • Chief Technology Officer •   Ex-Military Cyber-Defense Leader   • Security Consultant
          </motion.p>
          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <button
              onClick={openContact}
              className="px-6 py-3 bg-green-500 text-black rounded-lg hover:bg-green-600 transition"
            >
              Contact
            </button>
          </motion.div>
        </section>

        {/* Contact Popup */}
        <ContactPopup
          show={showContactPopup}
          onClose={closeContact}
          formData={contactForm}
          onChange={handleFormChange}
          onSubmit={handleFormSubmit}
        />

        {/* About Section */}
        <section id="about" className="py-20 px-6 md:px-20 bg-gray-900">
          <motion.h2
            className="text-4xl font-semibold mb-6 text-center text-white"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            About Me
          </motion.h2>
          <motion.p
            className="text-gray-300 max-w-3xl mx-auto text-lg"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {bio}
          </motion.p>
        </section>

        {/* Skills Section */}
        <SkillsSection skills={skills} explanations={skillExplanations} />

        {/* Experience Section */}
        <ExperienceSection experiences={experiences} />

        {/* Certifications Section */}
        <section id="certs" className="py-20 px-6 md:px-20">
          <motion.h2
            className="text-4xl font-semibold mb-8 text-center text-white"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Certifications & Education
          </motion.h2>
          <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {certifications.map((cert, idx) => (
              <motion.div
                key={idx}
                className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition"
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 * idx, duration: 0.5 }}
              >
                <p className="text-gray-200 text-lg">{cert}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Interests Section */}
        <section id="interests" className="py-20 px-6 md:px-20 bg-gray-900">
          <motion.h2
            className="text-4xl font-semibold mb-8 text-center text-white"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Interests
          </motion.h2>
          <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {interests.map((int, idx) => (
              <motion.div
                key={idx}
                className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition"
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 * idx, duration: 0.5 }}
              >
                <p className="text-gray-200 text-lg">{int}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="py-6 text-center text-gray-500">
          &copy; {new Date().getFullYear()} James McGonigal. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
