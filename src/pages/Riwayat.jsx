import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
      data,
      error
    } = await supabase
      .from("absensi")
      .select("*")
      .order("id", {
        ascending: false
      });

    if (!error) {
      setData(data || []);
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-7xl mx-auto">

        <h1 className="text-3xl font-bold mb-6">
          Riwayat Absensi
        </h1>

        <Link
    to="/dashboard"
    className="bg-blue-600 text-white px-4 py-2 rounded-lg"
  >
    Dashboard
  </Link>

        <div className="bg-white rounded-xl shadow overflow-auto">

          {loading ? (

            <div className="p-6">
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

                    <td className="p-3">
                      {a.nama}
                    </td>

                    <td className="p-3">

                      {a.tanggal
                        ? new Date(
                            a.tanggal
                          ).toLocaleDateString(
                            "id-ID",
                            {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            }
                          )
                        : "-"}

                    </td>

                    <td className="p-3">

                      {a.jam_masuk
                        ? new Date(
                            a.jam_masuk
                          ).toLocaleTimeString(
                            "id-ID",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : "-"}

                    </td>

                    <td className="p-3">

                      {a.jam_pulang
                        ? new Date(
                            a.jam_pulang
                          ).toLocaleTimeString(
                            "id-ID",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : "-"}

                    </td>

                    <td className="p-3">

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

                    <td className="p-3">

                      {a.latitude ? (

                        <a
                          href={`https://maps.google.com/?q=${a.latitude},${a.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          Lihat Lokasi
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