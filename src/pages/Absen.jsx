import { supabase } from "../supabase";
import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import Webcam from "react-webcam";

function Absen() {
  const webcamRef = useRef(null);

  const [loading, setLoading] = useState(false);

  async function absenMasuk() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Silakan login terlebih dahulu");
        return;
      }

      const hariIni = new Date()
        .toISOString()
        .split("T")[0];

      const { data: cek } = await supabase
        .from("absensi")
        .select("*")
        .eq("user_id", user.id)
        .eq("tanggal", hariIni);

      if (cek?.length > 0) {
        alert("Anda sudah absen hari ini");
        setLoading(false);
        return;
      }

      const foto = webcamRef.current?.getScreenshot();

      if (!foto) {
        alert("Kamera belum aktif");
        setLoading(false);
        return;
      }

      const blob = await fetch(foto).then((r) =>
        r.blob()
      );

      const namaFile = `${user.id}-${Date.now()}.jpg`;

      const { error: uploadError } =
        await supabase.storage
          .from("foto-absen")
          .upload(namaFile, blob);

      if (uploadError) {
        alert(uploadError.message);
        setLoading(false);
        return;
      }

      const { data: publicData } =
        supabase.storage
          .from("foto-absen")
          .getPublicUrl(namaFile);

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const sekarang = new Date();

          const batas = new Date();
          batas.setHours(9, 15, 0, 0);

          const status =
            sekarang > batas
              ? "Terlambat"
              : "Hadir";

          const { data, error } = await supabase
  .from("absensi")
  .insert({
    user_id: user.id,
    nama: user.user_metadata?.full_name || user.email,
    email: user.email,
    tanggal: hariIni,
    jam_masuk: sekarang,
    status: status,
    foto: publicData.publicUrl,
    latitude: pos.coords.latitude.toString(),
    longitude: pos.coords.longitude.toString(),
  })
  .select();

console.log("INSERT DATA:", data);
console.log("INSERT ERROR:", error);
          if (error) {
            alert(error.message);
          } else {
            alert(
              `Absen berhasil (${status})`
            );
          }

          setLoading(false);
        },
        () => {
          alert(
            "Izinkan akses lokasi terlebih dahulu"
          );
          setLoading(false);
        }
      );
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan");
      setLoading(false);
    }
  }

  async function absenPulang() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("absensi")
      .update({
        jam_pulang: new Date(),
      })
      .eq("user_id", user.id)
      .is("jam_pulang", null);

    if (error) {
      alert(error.message);
    } else {
      alert("Absen pulang berhasil");
    }
  }

  return (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">

    <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-4xl">

      {/* HEADER */}

      <div className="flex justify-between items-center mb-6">

        <Link
          to="/dashboard"
          className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
        >
          ← Dashboard
        </Link>

        <h1 className="text-3xl font-bold">
          ABSENSI SELFIE
        </h1>

        <div></div>

      </div>

      {/* KAMERA */}

      <div className="flex justify-center mb-6">

        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width={500}
          className="rounded-xl shadow-lg"
        />

      </div>

      {/* BUTTON */}

      <div className="flex justify-center gap-4">

        <button
          onClick={absenMasuk}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold"
        >
          {loading
            ? "Memproses..."
            : "ABSEN MASUK"}
        </button>

        <button
          onClick={absenPulang}
          className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold"
        >
          ABSEN PULANG
        </button>

      </div>

    </div>

  </div>
);
}

export default Absen;