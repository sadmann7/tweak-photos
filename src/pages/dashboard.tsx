import Tabs from "@/components/Tabs";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import ErrorScreen from "@/components/screens/ErrorScreen";
import LoadingScreen from "@/components/screens/LoadingScreen";
import Button from "@/components/ui/Button";
import type { NextPageWithLayout } from "@/pages/_app";
import type { ResponseData } from "@/types/globals";
import { api } from "@/utils/api";
import type { Photo } from "@prisma/client";
import { useIsMutating } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { twMerge } from "tailwind-merge";

const Dashboard: NextPageWithLayout = () => {
  // get photos query
  const photosQuery = api.photos.getMany.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  if (photosQuery.isLoading) {
    return <LoadingScreen />;
  }

  if (photosQuery.isError) {
    return <ErrorScreen error={photosQuery.error} />;
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
              You can edit, or delete photos from here
            </p>
          </div>
          <div className="grid place-items-center gap-6 md:grid-cols-2">
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
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const session = useSession();
  const apiUtils = api.useContext();

  // update restored photo mutation
  const updateRestoredMuation = api.photos.updateRestored.useMutation({
    onSuccess: () => {
      toast.success("Photo restored successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // update masked photo mutation
  const updateMaksedMuation = api.photos.updateMasked.useMutation({
    onSuccess: () => {
      toast.success("Photo restored successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // restore image
  const restoreImage = async (image: string) => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const response = await fetch("/api/restore", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image,
      }),
    });
    const response2 = (await response.json()) as ResponseData;
    if (response.status !== 200) {
      response2 instanceof Error
        ? setError(response2.message)
        : response2 instanceof Object
        ? setError(response2.output)
        : setError(response2);
      setIsLoading(false);
    } else {
      if (session.status === "authenticated") {
        await updateRestoredMuation.mutateAsync({
          id: photo.id,
          restoredImage: response2.output ?? "",
        });
      }
    }
  };

  // mask image
  const maskImage = async (image: string) => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const response = await fetch("/api/bgRemove", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image,
      }),
    });
    const response2 = (await response.json()) as ResponseData;
    if (response.status !== 200) {
      response2 instanceof Error
        ? setError(response2.message)
        : response2 instanceof Object
        ? setError(response2.output)
        : setError(response2);
      setIsLoading(false);
    } else {
      if (session.status === "authenticated") {
        await updateMaksedMuation.mutateAsync({
          id: photo.id,
          bgRemovedImage: response2.output ?? "",
        });
      }
    }
  };

  const deletePhotoMutation = api.photos.delete.useMutation({
    onSuccess: () => {
      toast.success("Photo deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // refetch photos query
  const number = useIsMutating();
  useEffect(() => {
    if (number === 0) {
      void apiUtils.photos.getMany.invalidate();
    }
  }, [number, apiUtils]);

  // configure loading state
  useEffect(() => {
    if (updateRestoredMuation.isLoading || updateMaksedMuation.isLoading) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [updateRestoredMuation, updateMaksedMuation]);

  // configure error state
  useEffect(() => {
    if (updateRestoredMuation.isError || updateMaksedMuation.isError) {
      setError("Something went wrong");
    } else {
      setError(null);
    }
  }, [updateRestoredMuation, updateMaksedMuation]);

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
            <div
              className={twMerge(
                "relative aspect-square",
                isLoading && "opacity-50"
              )}
            >
              {!photo.restoredImage ? (
                <Button
                  aria-label="Restore photo"
                  variant="primary"
                  className="absolute right-2 top-2 h-auto w-fit px-3 py-1 text-sm font-normal active:scale-95 sm:text-base"
                  onClick={() => void restoreImage(photo.editedImage)}
                  isLoading={isLoading}
                  loadingVariant="dots"
                  disabled={isLoading}
                >
                  Restore
                </Button>
              ) : !photo.bgRemovedImage ? (
                <Button
                  aria-label="Mask photo"
                  variant="primary"
                  className="absolute right-2 top-2 h-auto w-fit px-3 py-1 text-sm font-normal active:scale-95 sm:text-base"
                  onClick={() => void maskImage(photo.editedImage)}
                  isLoading={isLoading}
                  loadingVariant="dots"
                  disabled={isLoading}
                >
                  Mask
                </Button>
              ) : null}
              {isLoading ? (
                <div
                  aria-label="Loading"
                  role="progressbar"
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Loader2
                    className="h-28 w-28 animate-spin stroke-1 text-gray-300"
                    aria-hidden="true"
                  />
                </div>
              ) : error ? (
                <div
                  aria-label="Error"
                  role="alert"
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <span className="text-lg font-medium text-red-400 sm:text-xl">
                    {error}
                  </span>
                </div>
              ) : (
                <Image
                  src={photo.editedImage}
                  alt="Edited"
                  width={480}
                  height={480}
                />
              )}
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
                  variant="primary"
                  className="absolute right-2 top-2 h-auto w-fit px-3 py-1 text-sm font-normal active:scale-95 sm:text-base"
                  onClick={() =>
                    photo.restoredImage
                      ? void maskImage(photo.restoredImage)
                      : null
                  }
                  isLoading={isLoading}
                  loadingVariant="dots"
                  disabled={isLoading}
                >
                  Mask
                </Button>
              ) : null}
              {isLoading ? (
                <div
                  aria-label="Loading"
                  role="progressbar"
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Loader2
                    className="h-28 w-28 animate-spin stroke-1 text-gray-300"
                    aria-hidden="true"
                  />
                </div>
              ) : error ? (
                <div
                  aria-label="Error"
                  role="alert"
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <span className="text-lg font-medium text-red-400 sm:text-xl">
                    {error}
                  </span>
                </div>
              ) : (
                <Image
                  src={photo.restoredImage}
                  alt="Edited"
                  width={480}
                  height={480}
                />
              )}
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
                onClick={() => void restoreImage(photo.editedImage)}
                isLoading={isLoading}
                loadingVariant="dots"
                disabled={isLoading}
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
                  variant="primary"
                  className="absolute right-2 top-2 h-auto w-fit px-3 py-1 text-sm font-normal active:scale-95 sm:text-base"
                  onClick={() =>
                    photo.bgRemovedImage
                      ? void restoreImage(photo.bgRemovedImage)
                      : null
                  }
                  isLoading={isLoading}
                  loadingVariant="dots"
                  disabled={isLoading}
                >
                  Restore
                </Button>
              ) : null}
              {isLoading ? (
                <div
                  aria-label="Loading"
                  role="progressbar"
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Loader2
                    className="h-28 w-28 animate-spin stroke-1 text-gray-300"
                    aria-hidden="true"
                  />
                </div>
              ) : error ? (
                <div
                  aria-label="Error"
                  role="alert"
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <span className="text-lg font-medium text-red-400 sm:text-xl">
                    {error}
                  </span>
                </div>
              ) : (
                <Image
                  src={photo.bgRemovedImage}
                  alt="Background removed"
                  width={480}
                  height={480}
                />
              )}
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
                onClick={() =>
                  void maskImage(photo.restoredImage ?? photo.editedImage)
                }
                isLoading={isLoading}
                loadingVariant="dots"
                disabled={isLoading}
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
