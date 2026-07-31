/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";
import { FiMail, FiMapPin, FiSend, FiPhone, FiGlobe } from "react-icons/fi";
import { Link } from "react-router-dom";

const Contact = () => {
  // প্রিমিয়াম অ্যানিমেশন ভেরিয়েন্ট
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    })
  };

  return (
    <section className="min-h-screen bg-white pb-20 overflow-hidden">
      {/* 🟢 ১. ব্র্যান্ডেড হেডার (ক্যাটাগরি সেকশন স্টাইলে) */}
      <div className="mt-[105px] py-10 bg-[#FDFDFD] border border-gray-100">
        <div className="max-w-screen-2xl mx-auto px-6">
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h1 className="text-3xl md:text-5xl font-bold border-l-4 border-red-600 pl-6 text-gray-900 uppercase tracking-tighter font-mono">
              Contact <span className="text-red-600">Terminal</span>
            </h1>
            <div className="mt-4 flex items-center gap-2 text-[10px] text-gray-400 font-mono uppercase tracking-[0.3em] ml-8">
              <Link to="/" className="hover:text-red-600 transition-colors">Home</Link>
              <span>/</span>
              <span className="text-gray-900 font-black">Support Gear</span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          
       
          <div className="space-y-12">
            <div>
              <motion.h3 
                custom={1} initial="hidden" animate="visible" variants={fadeIn}
                className="text-xs font-black text-red-600 uppercase tracking-[0.4em] mb-4"
              >
                Connect with us
              </motion.h3>
              <motion.p 
                custom={2} initial="hidden" animate="visible" variants={fadeIn}
                className="text-gray-500 text-lg font-medium leading-relaxed max-w-md"
              >
                Have a tactical query or need gear assistance? Our team is standing by to assist your mission.
              </motion.p>
            </div>

            <div className="grid gap-8">
              {[
                { icon: <FiMail />, label: "Direct Email", value: "support@techvora.com", color: "text-red-600" },
                { icon: <FiPhone />, label: "Support Line", value: "+880 1XXX-XXXXXX", color: "text-gray-900" },
                { icon: <FiMapPin />, label: "HQ Location", value: "Dhaka, Bangladesh", color: "text-red-600" }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  custom={i + 3}
                  initial="hidden"
                  animate="visible"
                  variants={fadeIn}
                  className="flex gap-6 items-center group cursor-pointer"
                >
                  <div className={`p-4 rounded-2xl bg-gray-50 ${item.color} text-xl group-hover:bg-black group-hover:text-white transition-all duration-500 shadow-sm`}>
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-mono font-black text-[10px] text-gray-400 uppercase tracking-widest">{item.label}</h4>
                    <p className="text-gray-900 font-bold tracking-tight">{item.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* ডেকোরেটিভ এলিমেন্ট */}
            <motion.div 
              custom={6} initial="hidden" animate="visible" variants={fadeIn}
              className="p-8 bg-black rounded-[2rem] text-white relative overflow-hidden group"
            >
              <div className="relative z-10">
                <p className="text-[10px] font-mono font-black text-red-600 uppercase tracking-[0.3em] mb-2">Operational Hours</p>
                <p className="text-sm font-medium opacity-80">Sat - Thu: 10:00 AM - 08:00 PM</p>
              </div>
              <FiGlobe className="absolute -right-4 -bottom-4 text-8xl opacity-10 group-hover:rotate-12 transition-transform duration-1000" />
            </motion.div>
          </div>

          {/* 🟢 ৩. কন্টাক্ট ফর্ম - Clean & Sharp */}
          <motion.div
            custom={4}
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="bg-white p-8 md:p-12 rounded-[3rem] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)]"
          >
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-black uppercase tracking-widest ml-1 text-gray-400">Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:bg-white focus:border-red-600 transition-all text-sm font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-black uppercase tracking-widest ml-1 text-gray-400">Email Address</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:bg-white focus:border-red-600 transition-all text-sm font-bold"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-black uppercase tracking-widest ml-1 text-gray-400">Mission Subject</label>
                <input
                  type="text"
                  placeholder="Order Support / Inquiry"
                  className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:bg-white focus:border-red-600 transition-all text-sm font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono font-black uppercase tracking-widest ml-1 text-gray-400">Detailed Message</label>
                <textarea
                  rows="4"
                  placeholder="Describe your requirement..."
                  className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:bg-white focus:border-red-600 transition-all text-sm font-bold resize-none"
                ></textarea>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-5 bg-black text-white font-mono font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-red-600 transition-all duration-500 uppercase text-xs tracking-[0.3em] shadow-xl shadow-red-900/10"
              >
                Dispatch Message <FiSend className="text-lg" />
              </motion.button>
            </form>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Contact;