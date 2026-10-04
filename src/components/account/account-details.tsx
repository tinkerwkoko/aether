import { signOut } from "@/lib/auth-actions";

/**
 * Shows who is signed in and signs them out.
 * Sign out is a server action, so the session cookie is cleared on the server.
 */
export function AccountDetails({
  name,
  email,
}: {
  name: string | null;
  email: string | null;
}) {
  const displayName = name?.trim() ? name.trim() : null;

  return (
    <div>
      <p className="text-[0.68rem] uppercase tracking-[0.22em] text-muted">
        Signed in
      </p>

      <p className="mt-4 font-display text-2xl">
        {displayName ?? "Your account"}
      </p>

      {email ? (
        <p className="mt-2 text-sm text-muted">{email}</p>
      ) : null}

      <form action={signOut} className="mt-8">
        <button
          type="submit"
          className="inline-flex h-11 items-center border-b border-charcoal text-[0.72rem] uppercase tracking-[0.22em] transition-colors duration-200 hover:border-olive hover:text-olive"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}