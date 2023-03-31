import DefaultLayout from "@/components/layouts/DefaultLayout";
import Button from "@/components/ui/Button";
import type { NextPageWithLayout } from "@/pages/_app";
import { api } from "@/utils/api";
import Head from "next/head";
import { toast } from "react-hot-toast";

const Dashboard: NextPageWithLayout = () => {
  // get photos query
  const photosQuery = api.photos.getMany.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  // restore photo mutation
  const deletePhotoMutation = api.photos.delete.useMutation({
    onSuccess: async () => {
      await photosQuery.refetch();
      toast.success("Photo deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <>
      <Head>
        <title>Dashboard | TweakPhotos</title>
      </Head>
      <main className="w-full pb-32 pt-28">
        <div className="container grid max-w-5xl place-items-center gap-12 sm:gap-14">
          <div className="grid place-items-center gap-2">
            <h1 className="text-center text-4xl font-bold leading-tight text-gray-200 sm:text-6xl sm:leading-tight">
              Tweak your edited <span className="text-blue-400">photos</span>
            </h1>
            <p className="text-center text-lg text-gray-400 sm:text-xl">
              You can download, edit, or delete photos from here
            </p>
          </div>
        </div>
      </main>
    </>
  );
};

export default Dashboard;

Dashboard.getLayout = (page) => <DefaultLayout>{page}</DefaultLayout>;
