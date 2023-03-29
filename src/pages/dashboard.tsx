import DefaultLayout from "@/components/layouts/DefaultLayout";
import type { NextPageWithLayout } from "@/pages/_app";
import Head from "next/head";

const Dashboard: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>Dashboard | TweakPhotos</title>
      </Head>
      <main className="w-full pb-32 pt-40 sm:pt-32">
        <div className="container grid max-w-5xl place-items-center gap-12 sm:gap-14">
          <div className="grid place-items-center gap-2">
            <h1 className="text-center text-4xl font-bold">Dashboard page</h1>
            <p className="text-center">This is the dashboard page</p>
          </div>
        </div>
      </main>
    </>
  );
};

export default Dashboard;

Dashboard.getLayout = (page) => <DefaultLayout>{page}</DefaultLayout>;
