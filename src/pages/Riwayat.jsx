import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, MapPin } from "lucide-react";
import { supabase } from "../supabase";

function Riwayat() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ambilData();
  }, []);

  async function ambilData() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/";
      return;
    }

    // Tampilkan hanya riwayat milik user yang login
    const { data, error } = await supabase
      .from("absensi")
      .select("*")
      .eq("user_id", user.id)
      .order("id", { ascending: false });

    if (!error) setData(data || []);

    setLoading(false);
  }

  const fmtJam = (v) =>
    v
      ? new Date(v).toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Riwayat Absensi
            </h1>
            <p className="text-gray-500 text-sm">{data.length} catatan</p>
          </div>

          <Link
            to="/dashboard"
            className="flex items-center gap-2 bg-white shadow px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:text-indigo-600"
          >
            <ArrowLeft size={16} /> Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow overflow-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Memuat data...</div>
          ) : data.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Belum ada riwayat absensi.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-gray-600 text-left">
                <tr>
                  {["Foto", "Tanggal", "Masuk", "Pulang", "Status", "Lokasi"].map(
                    (h) => (
                      <th key={h} className="p-4 font-semibold">
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {data.map((a) => (
                  <tr key={a.id} className="border-t hover:bg-slate-50">
                    <td className="p-4">
                      {a.foto ? (
                        <img
                          src={a.foto}
                          alt="foto"
                          className="w-14 h-14 object-cover rounded-xl"
                        />
                      ) : (
                        "-"
                      )}
                    </td>

                    <td className="p-4">
                      {a.tanggal
                        ? new Date(a.tanggal).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })
                        : "-"}
                    </td>

                    <td className="p-4">{fmtJam(a.jam_masuk)}</td>
                    <td className="p-4">{fmtJam(a.jam_pulang)}</td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          a.status === "Terlambat"
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>

                    <td className="p-4">
                      {a.latitude ? (
                        <a
                          href={`https://maps.google.com/?q=${a.latitude},${a.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-indigo-600 hover:underline"
                        >
                          <MapPin size={14} /> Lihat
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default Riwayat;