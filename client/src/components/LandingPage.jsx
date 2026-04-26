import React from 'react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">
      {/* Navbar giả lập cho Landing Page */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-slate-950/50 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-500 shadow-lg shadow-cyan-500/20" />
            <span className="text-xl font-bold tracking-tight text-white">SmartAgent</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#services" className="text-sm font-medium text-slate-400 transition hover:text-cyan-400">Dịch vụ</a>
            <a href="#about" className="text-sm font-medium text-slate-400 transition hover:text-cyan-400">Về chúng tôi</a>
            <a href="#contact" className="text-sm font-medium text-slate-400 transition hover:text-cyan-400">Liên hệ</a>
            <button className="rounded-full bg-white px-5 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-400">Bắt đầu dự án</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-20">
        <div className="absolute top-20 -left-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute bottom-20 -right-20 h-96 w-96 rounded-full bg-indigo-500/10 blur-[120px]" />
        
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-300">
            SmartAgent Hybrid Support Engine
          </div>
          <h1 className="mt-8 text-5xl font-black tracking-tight text-white sm:text-7xl">
            Xây dựng tương lai <br />
            <span className="bg-gradient-to-r from-cyan-400 via-light-blue-400 to-indigo-500 bg-clip-text text-transparent">
              Phần mềm Outsourcing
            </span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-slate-400">
            Chúng tôi kết hợp trí tuệ nhân tạo (AI) và các chuyên gia hàng đầu để cung cấp giải pháp phần mềm đột phá, 
            tối ưu hóa chi phí và tăng tốc thời gian đưa sản phẩm ra thị trường.
          </p>
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <button className="group relative rounded-full bg-cyan-400 px-8 py-4 text-base font-bold text-slate-950 transition hover:bg-cyan-300">
              Khám phá giải pháp
              <div className="absolute -inset-1 rounded-full bg-cyan-400/20 opacity-0 blur transition group-hover:opacity-100" />
            </button>
            <button className="rounded-full border border-white/10 bg-white/5 px-8 py-4 text-base font-bold text-white transition hover:bg-white/10">
              Xem Portfolio
            </button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="relative py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Dịch vụ cốt lõi</h2>
            <p className="mt-4 text-slate-400">Những gì chúng tôi làm tốt nhất để giúp doanh nghiệp của bạn phát triển</p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              { title: "Phát triển Web & Mobile", desc: "Ứng dụng hiện đại, hiệu năng cao trên mọi nền tảng.", icon: "📱" },
              { title: "Tích hợp Trí tuệ nhân tạo", desc: "Tăng cường sức mạnh kinh doanh bằng AI/ML.", icon: "🤖" },
              { title: "Giải pháp ERP & CRM", desc: "Quản trị doanh nghiệp chuyên sâu và hiệu quả.", icon: "💼" }
            ].map((item, idx) => (
              <div key={idx} className="group rounded-3xl border border-white/5 bg-white/[0.02] p-8 transition hover:bg-white/[0.05] hover:shadow-2xl hover:shadow-cyan-500/10">
                <div className="mb-6 text-4xl">{item.icon}</div>
                <h3 className="text-xl font-bold text-white group-hover:text-cyan-400">{item.title}</h3>
                <p className="mt-4 leading-relaxed text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t border-white/5 py-12">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <div className="flex justify-center gap-2 mb-6">
            <div className="h-6 w-6 rounded bg-gradient-to-br from-cyan-400 to-indigo-500" />
            <span className="font-bold text-white">SmartAgent</span>
          </div>
          <p className="text-sm text-slate-500">© 2026 SmartAgent Software Solutions. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
