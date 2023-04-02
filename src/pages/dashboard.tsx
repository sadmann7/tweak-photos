import Tabs from "@/components/Tabs";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import Button from "@/components/ui/Button";
import type { NextPageWithLayout } from "@/pages/_app";
import { api } from "@/utils/api";
import type { Photo } from "@prisma/client";
import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import { toast } from "react-hot-toast";
const Dashboard: NextPageWithLayout = () => {
  // get photos query
  const photosQuery = api.photos.getMany.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  if (photosQuery.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <h1 className="text-3xl font-bold text-gray-200">Loading...</h1>
      </div>
    );
  }

  if (photosQuery.isError) {
    return (
      <div className="flex h-screen items-center justify-center">
        <h1 className="text-3xl font-bold text-gray-200">
          {photosQuery.error.message}
        </h1>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard | TweakPhotos</title>
      </Head>
      <main className="w-full pb-32 pt-28">
        <div className="container grid max-w-5xl place-items-center gap-8">
          <div className="grid place-items-center gap-2">
            <h1 className="text-center text-4xl font-bold leading-tight text-gray-200 sm:text-6xl sm:leading-tight">
              Your <span className="text-blue-400">photos</span>
            </h1>
            <p className="text-center text-lg text-gray-400 sm:text-xl">
              You can download, edit, or delete photos from here
            </p>
          </div>
          <div className="grid place-items-center gap-5">
            {photosQuery.data.map((photo) => (
              <PhotoCard key={photo.id} photo={photo} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
};

export default Dashboard;

Dashboard.getLayout = (page) => <DefaultLayout>{page}</DefaultLayout>;

const PhotoCard = ({ photo }: { photo: Photo }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const deletePhotoMutation = api.photos.delete.useMutation({
    onSuccess: () => {
      toast.success("Photo deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <Tabs
      selectedIndex={selectedIndex}
      setSelectedIndex={setSelectedIndex}
      tabs={[
        {
          name: "Original",
          content: (
            <div className="aspect-square">
              <Image
                src={photo.inputImage}
                alt="Original"
                width={480}
                height={480}
              />
            </div>
          ),
        },
        {
          name: "Edited",
          content: (
            <div className="relative aspect-square">
              {!photo.restoredImage ? (
                <Button
                  aria-label="Restore photo"
                  variant="gray"
                  className="absolute right-2 top-2 h-auto w-fit px-3 py-1 text-sm font-normal active:scale-95 sm:text-base"
                >
                  Restore
                </Button>
              ) : !photo.bgRemovedImage ? (
                <Button
                  aria-label="Mask photo"
                  variant="gray"
                  className="absolute right-2 top-2 h-auto w-fit px-3 py-1 text-sm font-normal active:scale-95 sm:text-base"
                >
                  Mask
                </Button>
              ) : null}
              <Image
                src={photo.editedImage}
                alt="Edited"
                width={480}
                height={480}
              />
            </div>
          ),
        },
        {
          name: "Restored",
          content: photo.restoredImage ? (
            <div className="relative aspect-square">
              {!photo.bgRemovedImage ? (
                <Button
                  aria-label="Mask photo"
                  variant="gray"
                  className="absolute right-2 top-2 h-auto w-fit px-3 py-1 text-sm font-normal active:scale-95 sm:text-base"
                >
                  Mask
                </Button>
              ) : null}
              <Image
                src={photo.restoredImage}
                alt="Edited"
                width={480}
                height={480}
              />
            </div>
          ) : (
            <div className="flex aspect-square flex-col items-center justify-center gap-5">
              <h2 className="text-xl font-bold text-gray-200 sm:text-2xl">
                Photo not restored yet
              </h2>
              <Button
                aria-label="Restore photo"
                variant="white"
                className="h-auto w-fit py-1.5 text-sm active:scale-95 sm:text-base"
              >
                Restore
              </Button>
            </div>
          ),
        },
        {
          name: "Masked",
          content: photo.bgRemovedImage ? (
            <div className="relative aspect-square">
              {!photo.restoredImage ? (
                <Button
                  aria-label="Restore photo"
                  variant="gray"
                  className="absolute right-2 top-2 h-auto w-fit px-3 py-1 text-sm font-normal active:scale-95 sm:text-base"
                >
                  Restore
                </Button>
              ) : null}
              <Image
                src={photo.bgRemovedImage}
                alt="Background removed"
                width={480}
                height={480}
              />
            </div>
          ) : (
            <div className="flex aspect-square flex-col items-center justify-center gap-5">
              <h2 className="text-xl font-bold text-gray-200 sm:text-2xl">
                Photo not masked yet
              </h2>
              <Button
                aria-label="Mask photo"
                variant="white"
                className="h-auto w-fit py-1.5 text-sm active:scale-95 sm:text-base"
              >
                Mask
              </Button>
            </div>
          ),
        },
      ]}
    />
  );
};
