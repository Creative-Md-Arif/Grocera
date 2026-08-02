const FooterBottom = () => {
  const year = new Date().getFullYear();

  return (
    <div className="border-t border-neutral-900 bg-neutral-950 font-figtree">
      <div className="max-w-screen-xl mx-auto px-4 py-3">
        <div className="flex flex-col items-center gap-2.5">
          <div className="w-12 h-[2px] bg-[#B88E2F] rounded-full" />
          <p className="text-[12px] lg:text-[14px] font-medium text-neutral-400 text-center tracking-[0.15em] uppercase">
            &copy; {year}{" "}
            <span className="text-[#B88E2F]">GROCERA</span>
            {" "}— All rights reserved.
          </p>

        </div>
      </div>
    </div>
  );
};

export default FooterBottom;