import { supabase } from "../supabase";
import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import Webcam from "react-webcam";
import { ArrowLeft, LogIn, LogOut, Loader2 } from "lucide-react";

function tanggalLokal(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function Absen() {
  const webcamRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [loadingPulang, setLoadingPulang] = useState(false);
  const [pesan, setPesan] = useState(null); // { type, text }

  async function absenMasuk() {
    setPesan(null);

    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setPesan({ type: "error", text: "Silakan login terlebih dahulu" });
        return;
      }

      const hariIni = tanggalLokal();

      const { data: cek } = await supabase
        .from("absensi")
        .select("id")
        .eq("user_id", user.id)
        .eq("tanggal", hariIni);

      if (cek?.length > 0) {
        setPesan({ type: "error", text: "Anda sudah absen hari ini" });
        return;
      }

      const foto = webcamRef.current?.getScreenshot();

      if (!foto) {
        setPesan({ type: "error", text: "Kamera belum aktif" });
        return;
      }

      const blob = await fetch(foto).then((r) => r.blob());
      const namaFile = `${user.id}-${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("foto-absen")
        .upload(namaFile, blob);

      if (uploadError) {
        setPesan({ type: "error", text: uploadError.message });
        return;
      }

      const { data: publicData } = supabase.storage
        .from("foto-absen")
        .getPublicUrl(namaFile);

      const pos = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject)
      ).catch(() => null);

      if (!pos) {
        setPesan({ type: "error", text: "Izinkan akses lokasi terlebih dahulu" });
        return;
      }

      const sekarang = new Date();
      const batas = new Date();
      batas.setHours(9, 15, 0, 0);

      const status = sekarang > batas ? "Terlambat" : "Hadir";

      const { error } = await supabase.from("absensi").insert({
        user_id: user.id,
        nama: user.user_metadata?.full_name || user.email,
        email: user.email,
        tanggal: hariIni,
        jam_masuk: sekarang,
        status,
        foto: publicData.publicUrl,
        latitude: pos.coords.latitude.toString(),
        longitude: pos.coords.longitude.toString(),
      });

      if (error) {
        setPesan({ type: "error", text: error.message });
      } else {
        setPesan({ type: "ok", text: `Absen masuk berhasil (${status})` });
      }
    } catch (err) {
      console.error(err);
      setPesan({ type: "error", text: "Terjadi kesalahan" });
    } finally {
      setLoading(false);
    }
  }

  async function absenPulang() {
    setPesan(null);
    setLoadingPulang(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("absensi")
      .update({ jam_pulang: new Date() })
      .eq("user_id", user.id)
      .eq("tanggal", tanggalLokal())
      .is("jam_pulang", null)
      .select();

    if (error) {
      setPesan({ type: "error", text: error.message });
    } else if (!data || data.length === 0) {
      setPesan({
        type: "error",
        text: "Belum absen masuk hari ini, atau sudah absen pulang",
      });
    } else {
      setPesan({ type: "ok", text: "Absen pulang berhasil" });
    }

    setLoadingPulang(false);
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6 flex items-center justify-center">
      <div className="bg-white shadow-xl rounded-3xl p-6 md:p-8 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 text-sm font-medium"
          >
            <ArrowLeft size={18} /> Dashboard
          </Link>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">
            Absensi Selfie
          </h1>
          <div className="w-20" />
        </div>

        <div className="relative rounded-2xl overflow-hidden bg-black mb-6 ring-4 ring-indigo-100">
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            mirrored
            videoConstraints={{ facingMode: "user" }}
            className="w-full"
          />
        </div>

        {pesan && (
          <div
            className={`mb-5 text-sm rounded-xl px-4 py-3 text-center ${
              pesan.type === "error"
                ? "bg-red-50 text-red-700"
                : "bg-green-50 text-green-700"
            }`}
          >
            {pesan.text}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={absenMasuk}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <LogIn size={18} />
            )}
            {loading ? "Memproses..." : "Absen Masuk"}
          </button>

          <button
            onClick={absenPulang}
            disabled={loadingPulang}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition"
          >
            {loadingPulang ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <LogOut size={18} />
            )}
            Absen Pulang
          </button>
        </div>
      </div>
    </div>
  );
}

export default Absen;