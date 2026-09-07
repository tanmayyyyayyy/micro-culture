import { useAuth } from "../context/AuthContext.jsx";

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="max-w-sm">
      <h1 className="text-2xl font-semibold mb-6">Profile</h1>
      <p className="text-neutral-400">Name: {user?.name}</p>
      <p className="text-neutral-400">Email: {user?.email}</p>
      <p className="text-neutral-400 mt-2">
        Cultures joined: {user?.joinedCultures?.length || 0}
      </p>
      <p className="text-neutral-400">
        Cultures created: {user?.createdCultures?.length || 0}
      </p>
    </div>
  );
}
