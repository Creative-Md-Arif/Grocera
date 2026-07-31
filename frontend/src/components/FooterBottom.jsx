const FooterBottom = () => {
  const year = new Date().getFullYear();

  return (
    <div className="border-t border-neutral-900 bg-neutral-950 font-figtree">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        <div className="flex flex-col items-center gap-2.5">


          <div className="w-12 h-[2px] bg-[#B88E2F] rounded-full" />

  
          <p className="text-[14px] font-bold text-neutral-400 text-center tracking-[0.15em] uppercase">
            &copy; {year}{" "}
            <span className="text-[#B88E2F]">Veloura</span>
            {" "}— All rights reserved.
          </p>

        </div>
      </div>
    </div>
  );
};

export default FooterBottom;