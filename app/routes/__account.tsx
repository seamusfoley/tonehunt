import type { LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import type { User } from "@supabase/supabase-js";
import { getSession } from "~/auth.server";
import { db } from "~/utils/db.server";
import type { Profile } from "@prisma/client";
import DefaultLayout from "~/layouts/DefaultLayout";

type LoaderData = {
  user?: User | null | undefined;
  profile?: Profile | null | undefined;
};

export const loader: LoaderFunction = async ({ request, context }) => {
  const { session, response } = await getSession(request);
  const user = session?.user;
  const url = new URL(request.url);

  if (!user) {
    return redirect(`/login?redirectTo=${url.pathname}${url.search}`, { headers: response.headers });
  }

  const profile = await db.profile.findFirst({ where: { id: session?.user.id } });

  return json<LoaderData>({
    user: session?.user,
    profile,
  });
};

export default function Layout() {
  const data = useLoaderData<LoaderData>();

  return (
    <DefaultLayout user={data.user} profile={data.profile}>
      <Outlet />
    </DefaultLayout>
  );
}
