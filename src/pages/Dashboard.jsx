import { Link, useNavigate } from "react-router-dom";
import {
  Clock,
  History,
  Users,
  Shield,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../supabase";

function Dashboard() {
  const navigate = useNavigate();

  const [hadir, setHadir] = useState(0);
  const [telat, setTelat] = useState(0);
  const [user, setUser] = useState(null);
  const [jam, setJam] = useState(new Date());

  useEffect(() => {
    loadUser();
    loadData();

    const interval = setInterval(() => {
      setJam(new Date());
    }, 1000);

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
  }

  async function loadData() {
    const hariIni = new Date()
      .toISOString()
      .split("T")[0];

    const { data, error } = await supabase
      .from("absensi")
      .select("*")
      .eq("tanggal", hariIni);

    if (!error && data) {
      setHadir(
        data.filter(
          (item) => item.status === "Hadir"
        ).length
      );

      setTelat(
        data.filter(
          (item) => item.status === "Terlambat"
        ).length
      );
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="bg-white rounded-xl shadow p-6 mb-6 flex justify-between items-center">

          <div className="flex items-center gap-4">

            <img
              src={
                user?.user_metadata?.avatar_url ||
                "https://via.placeholder.com/80"
              }
              alt="profile"
              className="w-16 h-16 rounded-full"
            />

            <div>
              <h2 className="text-xl font-bold">
                {user?.user_metadata?.full_name ||
                  "User"}
              </h2>

              <p className="text-gray-500">
                {user?.email}
              </p>
            </div>

          </div>

          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg"
          >
            Logout
          </button>

        </div>

        {/* JAM */}
        <div className="bg-white rounded-xl shadow p-6 mb-6 text-center">

          <h1 className="text-5xl font-bold">
            {jam.toLocaleTimeString("id-ID")}
          </h1>

          <p className="text-gray-500 mt-2">
            {jam.toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>

        </div>

        {/* MENU */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

          <Link to="/absen">
            <div className="bg-green-600 hover:bg-green-700 text-white rounded-xl shadow p-6 text-center cursor-pointer">

              <Clock
                size={40}
                className="mx-auto mb-2"
              />

              <h3 className="font-bold text-lg">
                ABSEN
              </h3>

            </div>
          </Link>

          <Link to="/riwayat">
            <div className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow p-6 text-center cursor-pointer">

              <History
                size={40}
                className="mx-auto mb-2"
              />

              <h3 className="font-bold text-lg">
                RIWAYAT
              </h3>

            </div>
          </Link>

          <Link to="/admin">
            <div className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow p-6 text-center cursor-pointer">

              <Shield
                size={40}
                className="mx-auto mb-2"
              />

              <h3 className="font-bold text-lg">
                ADMIN
              </h3>

            </div>
          </Link>

        </div>

        {/* STATISTIK */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div className="bg-white rounded-xl shadow p-5">

            <Users size={30} />

            <h3 className="mt-2 text-gray-500">
              Hadir Hari Ini
            </h3>

            <h1 className="text-4xl font-bold text-green-600">
              {hadir}
            </h1>

          </div>

          <div className="bg-white rounded-xl shadow p-5">

            <Clock size={30} />

            <h3 className="mt-2 text-gray-500">
              Terlambat Hari Ini
            </h3>

            <h1 className="text-4xl font-bold text-red-600">
              {telat}
            </h1>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Dashboard;