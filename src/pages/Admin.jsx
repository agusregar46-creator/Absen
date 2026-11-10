import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, Download, Filter, MapPin } from "lucide-react";
import { supabase } from "../supabase";
import * as XLSX from "xlsx";

function Admin() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [tanggal, setTanggal] = useState("");

  useEffect(() => {
    cekRole();
  }, []);

  async function cekRole() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/";
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      alert("Akses ditolak");
      window.location.href = "/dashboard";
      return;
    }

    setRole(profile.role);
    load();
  }

  async function load(tgl = tanggal) {
    setLoading(true);

    let query = supabase
      .from("absensi")
      .select("*")
      .order("id", { ascending: false });

    if (tgl) query = query.eq("tanggal", tgl);

    const { data, error } = await query;

    if (!error) setData(data || []);

    setLoading(false);
  }

  function resetFilter() {
    setTanggal("");
    load("");
  }

  function exportExcel() {
    const exportData = data.map((item) => ({
      Nama: item.nama,
      Email: item.email,
      Tanggal: item.tanggal,
      Jam_Masuk: item.jam_masuk,
      Jam_Pulang: item.jam_pulang,
      Status: item.status,
      Latitude: item.latitude,
      Longitude: item.longitude,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Absensi");
    XLSX.writeFile(wb, "Laporan_Absensi.xlsx");
  }

  const totalData = data.length;
  const totalHadir = data.filter((x) => x.status === "Hadir").length;
  const totalTerlambat = data.filter((x) => x.status === "Terlambat").length;

  const fmtJam = (v) => (v ? new Date(v).toLocaleTimeString("id-ID") : "-");

  if (role === null) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Memuat...
      </div>
    );
  }

  const stat = [
    { label: "Total Data", value: totalData, color: "text-gray-800" },
    { label: "Hadir", value: totalHadir, color: "text-green-600" },
    { label: "Terlambat", value: totalTerlambat, color: "text-red-600" },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Admin Absensi
          </h1>

          <div className="flex gap-2">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 bg-white shadow px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:text-indigo-600"
            >
              <ArrowLeft size={16} /> Dashboard
            </Link>

            <button
              onClick={() => load()}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium"
            >
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </div>

        {/* STATISTIK */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {stat.map((s) => (
            <div key={s.label} className="bg-white rounded-2xl shadow p-5">
              <p className="text-gray-500 text-sm">{s.label}</p>
              <p className={`text-4xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* FILTER */}
        <div className="bg-white rounded-2xl shadow p-4 mb-5 flex flex-wrap gap-3 items-center">
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="border border-gray-200 px-3 py-2 rounded-xl outline-none focus:border-indigo-500"
          />

          <button
            onClick={() => load()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium"
          >
            <Filter size={16} /> Filter
          </button>

          {tanggal && (
            <button
              onClick={resetFilter}
              className="text-sm text-gray-500 hover:text-gray-800 px-2"
            >
              Reset
            </button>
          )}

          <button
            onClick={exportExcel}
            className="ml-auto flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium"
          >
            <Download size={16} /> Export Excel
          </button>
        </div>

        {/* TABEL */}
        <div className="bg-white shadow rounded-2xl overflow-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Memuat data...</div>
          ) : data.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Tidak ada data.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-gray-600 text-left">
                <tr>
                  {[
                    "Foto",
                    "Nama",
                    "Email",
                    "Tanggal",
                    "Masuk",
                    "Pulang",
                    "Status",
                    "Lokasi",
                  ].map((h) => (
                    <th key={h} className="p-4 font-semibold">
                      {h}
                    </th>
                  ))}
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

                    <td className="p-4 font-medium text-gray-800">{a.nama}</td>
                    <td className="p-4 text-gray-600">{a.email}</td>
                    <td className="p-4">{a.tanggal}</td>
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
                          <MapPin size={14} /> Maps
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

export default Admin;