import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, Loader2 } from "lucide-react";
import { supabase } from "../supabase";

function Login() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("masuk"); // "masuk" | "daftar"
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState(null); // { type: "error" | "ok", text }

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) navigate("/dashboard");
    });
  }, [navigate]);

  async function submitEmail(e) {
    e.preventDefault();
    setPesan(null);
    setLoading(true);

    try {
      if (mode === "daftar") {
        if (password.length < 6) {
          setPesan({ type: "error", text: "Password minimal 6 karakter" });
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: nama },
            emailRedirectTo: window.location.origin + "/dashboard",
          },
        });

        if (error) {
          setPesan({ type: "error", text: error.message });
        } else if (data.session) {
          navigate("/dashboard");
        } else {
          setPesan({
            type: "ok",
            text: "Pendaftaran berhasil. Cek email Anda untuk konfirmasi, lalu masuk.",
          });
          setMode("masuk");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setPesan({
            type: "error",
            text:
              error.message === "Invalid login credentials"
                ? "Email atau password salah"
                : error.message,
          });
        } else {
          navigate("/dashboard");
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function loginGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/dashboard" },
    });

    if (error) setPesan({ type: "error", text: error.message });
  }

  const inputWrap =
    "flex items-center gap-3 border border-gray-200 bg-gray-50 rounded-xl px-4 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition";
  const input =
    "w-full bg-transparent py-3 outline-none text-gray-800 placeholder-gray-400";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl">
            🕘
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Absensi Kantor</h1>
          <p className="text-gray-500 text-sm mt-1">
            {mode === "masuk"
              ? "Masuk untuk melanjutkan"
              : "Buat akun baru Anda"}
          </p>
        </div>

        {/* TAB */}
        <div className="grid grid-cols-2 bg-gray-100 rounded-xl p-1 mb-6">
          {["masuk", "daftar"].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setPesan(null);
              }}
              className={`py-2 rounded-lg text-sm font-semibold capitalize transition ${
                mode === m
                  ? "bg-white shadow text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {pesan && (
          <div
            className={`mb-4 text-sm rounded-xl px-4 py-3 ${
              pesan.type === "error"
                ? "bg-red-50 text-red-700"
                : "bg-green-50 text-green-700"
            }`}
          >
            {pesan.text}
          </div>
        )}

        <form onSubmit={submitEmail} className="space-y-4">
          {mode === "daftar" && (
            <div className={inputWrap}>
              <User size={18} className="text-gray-400" />
              <input
                type="text"
                required
                placeholder="Nama lengkap"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className={input}
              />
            </div>
          )}

          <div className={inputWrap}>
            <Mail size={18} className="text-gray-400" />
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={input}
            />
          </div>

          <div className={inputWrap}>
            <Lock size={18} className="text-gray-400" />
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={input}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {mode === "masuk" ? "Masuk" : "Daftar"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">atau</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <button
          onClick={loginGoogle}
          type="button"
          className="w-full border border-gray-200 hover:bg-gray-50 py-3 rounded-xl font-semibold text-gray-700 flex items-center justify-center gap-3 transition"
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.5 17.7 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"/>
            <path fill="#FBBC05" d="M10.4 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.9-4.7l-7.8-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.8-6.1z"/>
            <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2.1 1.4-4.7 2.3-7.7 2.3-6.3 0-11.7-4-13.6-9.8l-7.8 6.1C6.5 42.6 14.6 48 24 48z"/>
          </svg>
          Lanjut dengan Google
        </button>
      </div>
    </div>
  );
}

export default Login;