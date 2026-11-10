import { Link, useNavigate } from "react-router-dom";
import { Clock, History, Users, Shield, LogOut, AlarmClock } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../supabase";

function tanggalLokal(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function Dashboard() {
  const navigate = useNavigate();

  const [hadir, setHadir] = useState(0);
  const [telat, setTelat] = useState(0);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [jam, setJam] = useState(new Date());

  useEffect(() => {
    loadUser();
    loadData();

    const interval = setInterval(() => setJam(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  async function loadUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate("/");
      return;
    }

    setUser(user);

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    setIsAdmin(profile?.role === "admin");
  }

  async function loadData() {
    const { data, error } = await supabase
      .from("absensi")
      .select("status")
      .eq("tanggal", tanggalLokal());

    if (!error && data) {
      setHadir(data.filter((x) => x.status === "Hadir").length);
      setTelat(data.filter((x) => x.status === "Terlambat").length);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    navigate("/");
  }

  const nama = user?.user_metadata?.full_name || user?.email || "User";
  const inisial = nama.charAt(0).toUpperCase();
  const avatar = user?.user_metadata?.avatar_url;

  const menu = [
    { to: "/absen", label: "Absen", icon: Clock, color: "from-emerald-500 to-green-600" },
    { to: "/riwayat", label: "Riwayat", icon: History, color: "from-sky-500 to-blue-600" },
    ...(isAdmin
      ? [{ to: "/admin", label: "Admin", icon: Shield, color: "from-violet-500 to-purple-600" }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      {/* HERO */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 text-white pb-24 pt-6 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {avatar ? (
                <img
                  src={avatar}
                  alt="profile"
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-full border-2 border-white/60"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
                  {inisial}
                </div>
              )}
              <div>
                <p className="text-indigo-100 text-sm">Selamat datang,</p>
                <h2 className="font-bold text-lg leading-tight">{nama}</h2>
              </div>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 px-4 py-2 rounded-xl text-sm font-medium transition"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>

          <div className="text-center mt-10">
            <h1 className="text-6xl font-bold tracking-tight tabular-nums">
              {jam.toLocaleTimeString("id-ID")}
            </h1>
            <p className="text-indigo-100 mt-2">
              {jam.toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-14 pb-10">
        {/* MENU */}
        <div
          className={`grid grid-cols-1 gap-4 mb-6 ${
            menu.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"
          }`}
        >
          {menu.map(({ to, label, icon: Icon, color }) => (
            <Link key={to} to={to}>
              <div
                className={`bg-gradient-to-br ${color} text-white rounded-2xl shadow-lg p-6 text-center hover:-translate-y-1 hover:shadow-xl transition`}
              >
                <Icon size={36} className="mx-auto mb-2" />
                <h3 className="font-bold tracking-wide">{label.toUpperCase()}</h3>
              </div>
            </Link>
          ))}
        </div>

        {/* STATISTIK */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl shadow p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center">
              <Users size={28} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Hadir Hari Ini</p>
              <p className="text-4xl font-bold text-green-600">{hadir}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
              <AlarmClock size={28} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Terlambat Hari Ini</p>
              <p className="text-4xl font-bold text-red-600">{telat}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;