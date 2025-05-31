// File: ContactPopup.jsx
import React from 'react';
import { motion } from 'framer-motion';

export default function ContactPopup({ show, onClose, formData, onChange, onSubmit }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75">
      <motion.div
        className="bg-gray-800 p-8 rounded-lg w-full max-w-md mx-4"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <h2 className="text-2xl font-semibold text-white mb-4">Contact Me</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-1" htmlFor="name">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={onChange}
              className="w-full px-3 py-2 bg-gray-700 text-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1" htmlFor="phone">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={onChange}
              className="w-full px-3 py-2 bg-gray-700 text-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1" htmlFor="company">
              Company
            </label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={onChange}
              className="w-full px-3 py-2 bg-gray-700 text-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1" htmlFor="reason">
              Reason
            </label>
            <select
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={onChange}
              className="w-full px-3 py-2 bg-gray-700 text-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="" disabled>
                Select a reason
              </option>
              <option value="Job offer">Job offer</option>
              <option value="Services inquiry">Services inquiry</option>
              <option value="Consult">Consult</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-gray-200 rounded hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-black rounded hover:bg-green-600 transition"
            >
              Send
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
