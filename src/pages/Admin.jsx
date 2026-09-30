import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

  async function load() {
    setLoading(true);

    let query = supabase
      .from("absensi")
      .select("*")
      .order("id", { ascending: false });

    if (tanggal) {
      query = query.eq("tanggal", tanggal);
    }

    const { data, error } = await query;

    if (!error) {
      setData(data || []);
    }

    setLoading(false);
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

    XLSX.utils.book_append_sheet(
      wb,
      ws,
      "Absensi"
    );

    XLSX.writeFile(
      wb,
      "Laporan_Absensi.xlsx"
    );
  }

  const totalData = data.length;

  const totalHadir = data.filter(
    (x) => x.status === "Hadir"
  ).length;

  const totalTerlambat = data.filter(
    (x) => x.status === "Terlambat"
  ).length;

  if (role === null) {
    return (
      <div className="p-10">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-7xl mx-auto">

        <h1 className="text-3xl font-bold mb-6">
          Admin Absensi
        </h1>

<Link
      to="/dashboard"
      className="bg-blue-600 text-white px-4 py-2 rounded-lg"
    >
      Dashboard
    </Link>

    <button
      onClick={load}
      className="bg-green-600 text-white px-4 py-2 rounded-lg"
    >
      Refresh
    </button>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

          <div className="bg-white rounded-xl shadow p-5">
            <h3 className="text-gray-500">
              Total Data
            </h3>

            <p className="text-3xl font-bold">
              {totalData}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <h3 className="text-gray-500">
              Hadir
            </h3>

            <p className="text-3xl font-bold text-green-600">
              {totalHadir}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <h3 className="text-gray-500">
              Terlambat
            </h3>

            <p className="text-3xl font-bold text-red-600">
              {totalTerlambat}
            </p>
          </div>

        </div>

        <div className="flex gap-3 mb-5 flex-wrap">

          <input
            type="date"
            value={tanggal}
            onChange={(e) =>
              setTanggal(e.target.value)
            }
            className="border p-2 rounded"
          />

          <button
            onClick={load}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Filter
          </button>

          <button
            onClick={exportExcel}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Export Excel
          </button>

        </div>

        <div className="bg-white shadow rounded-xl overflow-auto">

          {loading ? (

            <div className="p-5">
              Loading...
            </div>

          ) : (

            <table className="w-full">

              <thead className="bg-gray-200">

                <tr>

                  <th className="p-3">
                    Foto
                  </th>

                  <th className="p-3">
                    Nama
                  </th>

                  <th className="p-3">
                    Email
                  </th>

                  <th className="p-3">
                    Tanggal
                  </th>

                  <th className="p-3">
                    Masuk
                  </th>

                  <th className="p-3">
                    Pulang
                  </th>

                  <th className="p-3">
                    Status
                  </th>

                  <th className="p-3">
                    Lokasi
                  </th>

                </tr>

              </thead>

              <tbody>

                {data.map((a) => (

                  <tr
                    key={a.id}
                    className="border-b text-center"
                  >

                    <td className="p-3">

                      {a.foto ? (

                        <img
                          src={a.foto}
                          alt="foto"
                          className="w-16 h-16 object-cover rounded mx-auto"
                        />

                      ) : (
                        "-"
                      )}

                    </td>

                    <td>{a.nama}</td>

                    <td>{a.email}</td>

                    <td>{a.tanggal}</td>

                    <td>

                      {a.jam_masuk
                        ? new Date(
                            a.jam_masuk
                          ).toLocaleTimeString(
                            "id-ID"
                          )
                        : "-"}

                    </td>

                    <td>

                      {a.jam_pulang
                        ? new Date(
                            a.jam_pulang
                          ).toLocaleTimeString(
                            "id-ID"
                          )
                        : "-"}

                    </td>

                    <td>

                      <span
                        className={
                          a.status === "Terlambat"
                            ? "text-red-600 font-bold"
                            : "text-green-600 font-bold"
                        }
                      >
                        {a.status}
                      </span>

                    </td>

                    <td>

                      {a.latitude ? (

                        <a
                          href={`https://maps.google.com/?q=${a.latitude},${a.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          Maps
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