import { motion } from 'framer-motion';
import { FiArrowRight, FiTarget, FiShield, FiZap } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const About = () => {
  // অ্যানিমেশন ভেরিয়েন্ট
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, duration: 0.8 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <div className="bg-[#FFFFFF] px-6 overflow-hidden">
      <div className="max-w-screen-xl mx-auto pt-32 pb-24 xl:pt-48 xl:pb-32">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24"
        >
          
          {/* 🟢 ১. ভিজ্যুয়াল আর্কিটেকচার (Tactical Image Layout) */}
          <motion.div variants={itemVariants} className="w-full lg:w-1/2 relative">
            {/* Background Decorative Rings */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-red-50 rounded-full blur-[80px] opacity-60" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gray-100 rounded-full blur-[80px] opacity-60" />
            
            {/* Main Image Container */}
            <div className="relative z-10 p-4 bg-white border border-gray-100 rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.07)]">
              <div className="overflow-hidden rounded-[2.2rem]">
                <motion.img 
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 1, ease: "circOut" }}
                  src="https://i.imgur.com/WbQnbas.png" 
                  alt="Veloura Command" 
                  className="w-full h-auto object-cover"
                />
              </div>

              {/* Stats Overlay Badge */}
              <motion.div 
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="absolute -right-6 top-1/2 -translate-y-1/2 bg-black text-white p-8 rounded-[2.5rem] shadow-2xl border-4 border-white hidden sm:block"
              >
                <div className="text-center">
                  <p className="text-red-500 font-mono font-black text-3xl">99%</p>
                  <p className="text-[9px] uppercase tracking-[0.2em] font-bold opacity-70">Uptime <br/> Efficiency</p>
                </div>
              </motion.div>
            </div>

            {/* Tactical Corners */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-red-600 rounded-tl-3xl" />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-gray-900 rounded-br-3xl" />
          </motion.div>

          {/* 🟢 ২. কন্টেন্ট আর্কিটেকচার (Typography & Hierarchy) */}
          <div className="w-full lg:w-1/2 space-y-10">
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-[2px] w-8 bg-red-600" />
                <span className="text-red-600 font-mono font-black tracking-[0.5em] uppercase text-[10px]">
                  Authorized Gear Dept.
                </span>
              </div>
              <h2 className="text-5xl sm:text-7xl font-mono font-black text-gray-900 tracking-tighter leading-[0.9] uppercase">
                Precision <br /> 
                <span className="text-red-600">Redefined.</span>
              </h2>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-6">
              <p className="text-gray-500 text-lg md:text-xl font-medium leading-relaxed italic border-l-2 border-red-100 pl-6">
                &quot;We don&apos;t just provide hardware; we equip the pioneers of the digital frontier.&quot;
              </p>
              <p className="text-gray-600 text-base leading-relaxed">
                At <b>Veloura</b>, our mission is to eliminate the gap between human potential and technological limits. We curate a specialized arsenal of high-end peripherals and smart solutions, ensuring every click, keypress, and command is executed with absolute precision.
              </p>
            </motion.div>

            {/* 🟢 ৩. ফিডচার গ্রিড (Icons & Small Points) */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
              {[
                { icon: <FiTarget />, label: "Targeted Quality" },
                { icon: <FiShield />, label: "Tactical Safety" },
                { icon: <FiZap />, label: "Instant Flux" }
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3 group">
                  <div className="p-3 bg-gray-50 text-red-600 rounded-xl group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
                    {feature.icon}
                  </div>
                  <span className="text-[10px] font-mono font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-900 transition-colors">
                    {feature.label}
                  </span>
                </div>
              ))}
            </motion.div>

            {/* 🟢 ৪. অ্যাকশন বাটন */}
            <motion.div variants={itemVariants} className="pt-6">
              <Link to="/shop" className="inline-block">
                <button className="group relative px-12 py-5 bg-black overflow-hidden rounded-2xl transition-all duration-500 hover:shadow-[0_20px_40px_rgba(220,38,38,0.2)]">
                  <div className="absolute inset-0 w-0 bg-red-600 transition-all duration-[0.6s] ease-[0.22, 1, 0.36, 1] group-hover:w-full" />
                  <span className="relative z-10 flex items-center gap-3 font-mono font-black text-white text-xs uppercase tracking-[0.3em]">
                    Join The Fleet <FiArrowRight className="group-hover:translate-x-2 transition-transform duration-300" />
                  </span>
                </button>
              </Link>
            </motion.div>
          </div>

        </motion.div>
      </div>

      {/* Background Static Element */}
      <div className="absolute top-[20%] right-[-5%] text-[15vw] font-mono font-black text-gray-50/50 select-none -z-10 tracking-tighter">
       Veloura
      </div>
    </div>
  );
}

export default About;