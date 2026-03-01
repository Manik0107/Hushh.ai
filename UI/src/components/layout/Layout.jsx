import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Layout({ navbarProps, sidebarProps, children }) {
  const isDesktopOpen = Boolean(sidebarProps?.isDesktopOpen);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[-140px] top-[120px] h-[320px] w-[320px] rounded-full bg-slate-200/60 blur-3xl" />
        <div className="absolute left-[-120px] top-[420px] h-[260px] w-[260px] rounded-full bg-slate-100 blur-3xl" />
      </div>

      <Navbar {...navbarProps} />
      <Sidebar {...sidebarProps} />

      <main
        className={`relative z-10 px-3 pb-8 pt-20 sm:px-5 md:pr-6 ${
          isDesktopOpen ? 'md:pl-[15.5rem]' : 'md:pl-6'
        }`}
      >
        <div className="mx-auto max-w-[1150px]">{children}</div>
      </main>
    </div>
  );
}
