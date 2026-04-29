import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import chatService from '../services/chatService';

export default function BotSettings() {
  const [settings, setSettings] = useState({
    handoverThreshold: 50,
    businessPrompt: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const data = await chatService.getBotSettings();
    if (data) {
      setSettings(data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    const success = await chatService.updateBotSettings(settings);
    if (success) {
      setMessage({ type: 'success', text: 'Cấu hình đã được lưu thành công!' });
    } else {
      setMessage({ type: 'error', text: 'Lỗi khi lưu cấu hình. Vui lòng thử lại.' });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
          <p className="text-slate-400">Đang tải cấu hình...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">SmartAgent Admin</p>
              <h1 className="text-2xl font-bold text-white">Cấu Hình Bot</h1>
            </div>
          </div>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-2.5 font-bold text-white shadow-lg shadow-cyan-500/25 transition hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            Lưu Cấu Hình
          </button>
        </div>

        {message.text && (
          <div className={`mb-6 rounded-2xl border p-4 flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}>
            <span>{message.type === 'success' ? '✅' : '❌'}</span>
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column: Settings */}
          <div className="lg:col-span-2 space-y-6">
            <section className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white mb-1">Chỉ dẫn nghiệp vụ cho AI (Business Prompt)</h2>
                <p className="text-sm text-slate-400">Định nghĩa kiến thức, phong cách và các lưu ý riêng cho Bot của bạn.</p>
              </div>
              
              <textarea
                value={settings.businessPrompt}
                onChange={(e) => setSettings({ ...settings, businessPrompt: e.target.value })}
                rows={12}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all leading-relaxed"
                placeholder="Ví dụ: Công ty SmartAgent chuyên cung cấp giải pháp chuyển đổi số... Hãy luôn trả lời khách hàng bằng tông giọng vui vẻ, chuyên nghiệp."
              />
              
              <div className="mt-4 flex items-start gap-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20 p-4">
                <span className="text-cyan-400">💡</span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong>Mẹo:</strong> Bạn nên mô tả ngắn gọn về sản phẩm, giá cả sơ bộ và văn hóa doanh nghiệp. AI sẽ tự động kết hợp phần này với các quy tắc kỹ thuật để tư vấn tốt nhất.
                </p>
              </div>
            </section>
          </div>

          {/* Right Column: Threshold & Info */}
          <div className="space-y-6">
            <section className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white mb-1">Mốc Handover</h2>
                <p className="text-sm text-slate-400">Điểm số để Bot yêu cầu nhân viên vào hỗ trợ.</p>
              </div>

              <div className="flex flex-col items-center gap-6 py-4">
                <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-4 border-slate-800 bg-slate-950 shadow-inner">
                  <div className="text-center">
                    <span className="block text-4xl font-black text-cyan-400">{settings.handoverThreshold}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Điểm 🔥</span>
                  </div>
                  {/* Pulse Effect for High Threshold */}
                  <div className={`absolute inset-0 rounded-full border-2 border-cyan-500/30 ${settings.handoverThreshold >= 50 ? 'animate-ping' : ''}`}></div>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.handoverThreshold}
                  onChange={(e) => setSettings({ ...settings, handoverThreshold: parseInt(e.target.value) })}
                  className="w-full h-2 rounded-lg bg-slate-800 appearance-none cursor-pointer accent-cyan-500"
                />

                <div className="flex w-full justify-between px-1 text-[10px] font-bold text-slate-500 uppercase">
                  <span>Dễ (0)</span>
                  <span>Trung bình (50)</span>
                  <span>Khó (100)</span>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <p className="text-xs text-slate-400 leading-relaxed">
                  • <strong>Thấp (0-30):</strong> Bot sẽ bàn giao rất nhanh, ngay khi khách vừa hỏi câu đầu tiên.
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  • <strong>Trung bình (50):</strong> Cân bằng giữa việc Bot tư vấn và nhân viên chốt đơn. (Khuyên dùng)
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  • <strong>Cao (80-100):</strong> Bot sẽ cố gắng tự giải quyết hết mọi việc, chỉ bàn giao khi khách thực sự muốn mua hoặc bực bội.
                </p>
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl border-dashed">
                <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-wider">Hàng rào bảo vệ</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Hệ thống SmartAgent tự động bảo vệ các quy tắc cốt lõi (JSON, trích xuất SĐT, quy tắc một câu hỏi). Bạn chỉ cần tập trung vào nội dung tư vấn nghiệp vụ.
                </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
