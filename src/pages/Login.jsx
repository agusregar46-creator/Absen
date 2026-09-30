import { supabase } from "../supabase";

function Login() {

  async function login() {

    const { error } =
      await supabase.auth.signInWithOAuth({

        provider: "google",

        options: {
          redirectTo:
            window.location.origin + "/dashboard"
        }

      });

    if (error) {
      console.error(error);
      alert(error.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">

      <div className="bg-white shadow rounded-xl p-10">

        <h1 className="text-3xl font-bold mb-5">
          Absensi Kantor
        </h1>

        <button
          onClick={login}
          className="bg-blue-600 text-white px-5 py-3 rounded"
        >
          Login Google
        </button>

      </div>

    </div>
  );
}

export default Login;