import CompareSlider from "@/components/CompareSlider";
import CropModal from "@/components/CropModal";
import Tabs from "@/components/Tabs";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import Accordion from "@/components/ui/Accordion";
import Button from "@/components/ui/Button";
import ColorPicker from "@/components/ui/ColorPicker";
import DropdownSelect from "@/components/ui/DropdownSelect";
import FileInput from "@/components/ui/FileInput";
import Toggle from "@/components/ui/Toggle";
import ToggleInput from "@/components/ui/ToggleInput";
import type { NextPageWithLayout } from "@/pages/_app";
import {
  COSMETICS,
  HAIR_COLOR,
  PRESET,
  SMILE,
  type OriginalImage,
  type ResponseData,
  type UploadedFile,
} from "@/types/globals";
import { downloadFile } from "@/utils/download";
import { hexToHairColor } from "@/utils/format";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { zodResolver } from "@hookform/resolvers/zod";
import "cropperjs/dist/cropper.css";
import { AlertTriangle, Download, Loader2, Upload } from "lucide-react";
import Head from "next/head";
import Image from "next/image";
import { Fragment, useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "react-hot-toast";
import { z } from "zod";

const schema = z.object({
  image: z.unknown().refine((v) => v instanceof File, {
    message: "Upload an image",
  }),
  preset: z.nativeEnum(PRESET).default(PRESET.NO_PRESET),
  hairColor: z.nativeEnum(HAIR_COLOR).default(HAIR_COLOR.DEFAULT),
  smile: z.nativeEnum(SMILE).default(SMILE.NO_SMILE),
  cosmetics: z.array(z.nativeEnum(COSMETICS)).default([]),
  restored: z.boolean().default(false),
  bgRemoved: z.boolean().default(false),
});
type TInputs = z.infer<typeof schema>;

const Home: NextPageWithLayout = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [cropData, setCropData] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<OriginalImage | null>(
    null
  );
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [finalImage, setFinalImage] = useState<string | null>(null);
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [isComparing, setIsComparing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isGeneratedLoaded, setIsGeneratedLoaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // react-hook-form
  const { handleSubmit, formState, watch, control, setValue, reset } =
    useForm<TInputs>({
      resolver: zodResolver(schema),
    });
  const onSubmit: SubmitHandler<TInputs> = async (data) => {
    console.log(data);
    await new Promise((resolve) => setTimeout(resolve, 200));
    if (!(data.image instanceof File)) return;
    await generateImage(data);
  };

  // generate image
  const generateImage = async (data: TInputs) => {
    // upload image to cloudinary
    if (!(data.image instanceof File)) return;
    await new Promise((resolve) => setTimeout(resolve, 200));
    setIsLoading(true);

    const reader = new FileReader();
    reader.readAsDataURL(data.image);
    reader.onload = async () => {
      const base64 = reader.result;
      if (typeof base64 !== "string") return;
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          base64: cropData ? cropData : base64,
        }),
      });

      if (uploadResponse.status !== 200) {
        toast.error("Something went wrong");
        setIsLoading(false);
      } else {
        if (!(data.image instanceof File)) return;
        const uploadedFile = (await uploadResponse.json()) as UploadedFile;
        if (!uploadedFile) return;
        setOriginalImage({
          name: data.image.name,
          url: uploadedFile.secureUrl,
        });

        // generate image from replicate
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 200));
        setIsLoading(true);
        const editResponse = await fetch("/api/edit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...data,
            image: uploadedFile.secureUrl,
          }),
        });

        const editResponse2 = (await editResponse.json()) as ResponseData;
        if (editResponse.status !== 200) {
          editResponse2 instanceof Error
            ? setError(editResponse2.message)
            : editResponse2 instanceof Object
            ? setError(editResponse2.output)
            : setError(editResponse2);
          setIsLoading(false);
        } else {
          setGeneratedImage(editResponse2.output);

          if (watch("restored")) {
            // restore image
            await new Promise((resolve) => setTimeout(resolve, 200));
            const restoreResponse = await fetch("/api/restore", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                image: editResponse2.output,
              }),
            });
            const restoreResponse2 =
              (await restoreResponse.json()) as ResponseData;
            if (restoreResponse.status !== 200) {
              restoreResponse2 instanceof Error
                ? setError(restoreResponse2.message)
                : restoreResponse2 instanceof Object
                ? setError(restoreResponse2.output)
                : setError(restoreResponse2);
              setIsLoading(false);
            } else {
              setFinalImage(restoreResponse2.output);
            }
          } else if (watch("bgRemoved")) {
            // remove background
            await new Promise((resolve) => setTimeout(resolve, 200));
            const removeBgResponse = await fetch("/api/removeBg", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                image: editResponse2.output,
              }),
            });
            const removeBgResponse2 =
              (await removeBgResponse.json()) as ResponseData;
            if (removeBgResponse.status !== 200) {
              removeBgResponse2 instanceof Error
                ? setError(removeBgResponse2.message)
                : removeBgResponse2 instanceof Object
                ? setError(removeBgResponse2.output)
                : setError(removeBgResponse2);
              setIsLoading(false);
            } else {
              setFinalImage(removeBgResponse2.output);
            }
          }

          setIsLoading(false);
          setSelectedTabIndex(1);
        }
      }
    };
  };

  // auto animate
  const [notPresetRef] = useAutoAnimate();

  console.log({
    originalImage,
    generatedImage,
    finalImage,
    isLoading,
  });

  // time counter for image generation
  useEffect(() => {
    if (!isLoading) {
      setTimeElapsed(0);
      return;
    }
    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isLoading]);

  // revoke object URL when component unmounts
  useEffect(() => {
    if (!selectedFile) return;
    return () => URL.revokeObjectURL(selectedFile.name);
  }, [selectedFile]);

  return (
    <>
      <Head>
        <title>TweakPhotos</title>
      </Head>
      <main className="w-full pb-32 pt-40 sm:pt-32">
        <div className="container grid max-w-5xl place-items-center gap-12 sm:gap-14">
          <div className="grid w-full  max-w-4xl place-items-center gap-5">
            <h1 className="text-center text-4xl font-bold leading-tight text-gray-200 sm:text-6xl sm:leading-tight">
              Edit your face photos using AI
            </h1>
            <p className="text-center text-lg text-gray-400 sm:text-xl">
              Upload your face photo and tweak it to your liking
            </p>
          </div>
          {isLoading ? (
            <div className="relative overflow-hidden rounded-lg ring-1 ring-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-900">
              <div className="absolute inset-0 z-10 mx-auto flex max-w-xs flex-col items-center justify-center gap-2 text-gray-50">
                <Loader2
                  className="h-16 w-16 animate-spin"
                  aria-hidden="true"
                />
                <h2 className="text-center text-base font-semibold sm:text-lg">
                  Generating image, this usually takes 25-30 seconds...
                </h2>
                <p className="text-center text-base font-semibold sm:text-lg">
                  {`${
                    timeElapsed >= 60 ? `${Math.floor(timeElapsed / 60)}m` : ""
                  }${timeElapsed % 60}s`}
                </p>
              </div>
              <Image
                src={
                  selectedFile
                    ? URL.createObjectURL(selectedFile)
                    : "/images/placeholder.svg"
                }
                alt="selected file"
                width={480}
                height={480}
                className="object-cover opacity-50 blur-md filter"
              />
              <div className="absolute inset-0 bg-gray-900 bg-opacity-50" />
            </div>
          ) : error ? (
            <div
              aria-label="Error"
              role="alert"
              className="grid w-full place-items-center gap-4"
            >
              <AlertTriangle
                className="h-28 w-28 animate-pulse text-red-500"
                aria-hidden="true"
              />
              <div className="grid w-full place-items-center gap-1.5">
                <h2 className="text-lg font-medium text-gray-50 sm:text-xl">
                  Something went wrong
                </h2>
                <p className="text-sm text-gray-400 sm:text-base">{error}</p>
              </div>
              <Button
                aria-label="Try again"
                className="w-fit"
                onClick={() => {
                  setOriginalImage(null);
                  setGeneratedImage(null);
                  setFinalImage(null);
                  setSelectedFile(null);
                  setIsCropperOpen(false);
                  setCropData(null);
                  setIsLoading(false);
                  setIsGeneratedLoaded(false);
                  setIsComparing(false);
                  setError(null);
                  setIsDownloading(false);
                  reset();
                }}
              >
                Try again
              </Button>
            </div>
          ) : originalImage && generatedImage ? (
            <div className="grid place-items-center gap-8">
              {isGeneratedLoaded ? (
                <Toggle
                  enabled={isComparing}
                  setEnabled={setIsComparing}
                  enabledLabel="Compare"
                  disabledLabel="Side by side"
                />
              ) : null}
              {isComparing ? (
                <CompareSlider
                  itemOneName={originalImage.name ?? "original"}
                  itemOneUrl={originalImage.url}
                  itemTwoName="Generated"
                  itemTwoUrl={finalImage ?? generatedImage}
                  className="aspect-square max-h-[480px] rounded-xl"
                />
              ) : (
                <Tabs
                  selectedIndex={selectedTabIndex}
                  setSelectedIndex={setSelectedTabIndex}
                  tabs={[
                    {
                      name: "Original",
                      content: (
                        <Image
                          src={originalImage.url}
                          alt={originalImage.name ?? "original"}
                          width={480}
                          height={480}
                          className="aspect-square rounded-md"
                          priority
                        />
                      ),
                    },
                    {
                      name: "Edited",
                      content: (
                        <div className="relative">
                          <Button
                            aria-label="Download image"
                            variant="gray"
                            className="absolute right-2.5 top-2.5 z-10 h-auto w-fit gap-2 rounded-full border border-gray-950 bg-gray-700/70 p-2.5 hover:bg-gray-700 focus:border-none active:scale-95"
                            onClick={() => {
                              setIsDownloading(true);
                              downloadFile(generatedImage, "edited-photo.webp");
                              setTimeout(() => {
                                setIsDownloading(false);
                              }, 500);
                            }}
                            disabled={isDownloading}
                          >
                            {isDownloading ? (
                              <Loader2
                                className="h-5 w-5 animate-spin"
                                aria-hidden="true"
                              />
                            ) : (
                              <Download
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            )}
                          </Button>
                          <Image
                            src={generatedImage}
                            alt={"Generated"}
                            width={480}
                            height={480}
                            className="aspect-square rounded-md"
                            priority
                            onLoadingComplete={() => setIsGeneratedLoaded(true)}
                          />
                        </div>
                      ),
                    },
                    {
                      name: finalImage
                        ? watch("restored")
                          ? "Restored"
                          : watch("bgRemoved")
                          ? "Masked"
                          : null
                        : null,
                      content: finalImage ? (
                        <div className="relative">
                          <Button
                            aria-label="Download image"
                            variant="gray"
                            className="absolute right-2.5 top-2.5 z-10 h-auto w-fit gap-2 rounded-full border border-gray-950 bg-gray-700/70 p-2.5 hover:bg-gray-700 focus:border-none active:scale-95"
                            onClick={() => {
                              setIsDownloading(true);
                              downloadFile(
                                finalImage,
                                `${
                                  watch("restored") ? "restored" : "masked"
                                }-photo.webp`
                              );
                              setTimeout(() => {
                                setIsDownloading(false);
                              }, 500);
                            }}
                            disabled={isDownloading}
                          >
                            {isDownloading ? (
                              <Loader2
                                className="h-5 w-5 animate-spin"
                                aria-hidden="true"
                              />
                            ) : (
                              <Download
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            )}
                          </Button>
                          <Image
                            src={finalImage}
                            alt={"Final"}
                            width={480}
                            height={480}
                            className="aspect-square rounded-md"
                            priority
                          />
                        </div>
                      ) : null,
                    },
                  ].filter((tab) => tab.name && tab.content)}
                />
              )}
              <Button
                aria-label="Generate another image"
                className="w-full gap-2 text-sm sm:text-base"
                onClick={() => {
                  setOriginalImage(null);
                  setGeneratedImage(null);
                  setFinalImage(null);
                  setSelectedFile(null);
                  setIsCropperOpen(false);
                  setCropData(null);
                  setIsLoading(false);
                  setIsGeneratedLoaded(false);
                  setIsComparing(false);
                  setError(null);
                  setIsDownloading(false);
                  reset();
                }}
              >
                <Upload className="h-4 w-4 stroke-2" aria-hidden="true" />
                <span className="whitespace-nowrap">Edit again</span>
              </Button>
            </div>
          ) : (
            <form
              aria-label="Generate image form"
              className="grid w-full max-w-lg place-items-center"
              onSubmit={(...args) => void handleSubmit(onSubmit)(...args)}
            >
              <fieldset className="grid w-full gap-2.5">
                <label
                  htmlFor="preset"
                  className="text-sm font-medium text-gray-50 sm:text-base"
                >
                  Choose preset
                </label>
                <DropdownSelect
                  control={control}
                  name="preset"
                  options={Object.values(PRESET)}
                />
                {formState.errors.preset ? (
                  <p className="-mt-1 text-sm font-medium text-red-500">
                    {formState.errors.preset.message}
                  </p>
                ) : null}
              </fieldset>
              <div ref={notPresetRef} className="w-full">
                {watch("preset") === PRESET.NO_PRESET ||
                watch("preset") === undefined ? (
                  <div className="mt-6 space-y-6">
                    <fieldset className="grid w-full gap-2.5">
                      <label
                        htmlFor="hairColor"
                        className="text-sm font-medium text-gray-50 sm:text-base"
                      >
                        Choose hair color
                      </label>
                      <ColorPicker
                        control={control}
                        name="hairColor"
                        options={Object.values(HAIR_COLOR)}
                        formatHex={hexToHairColor}
                      />
                      {formState.errors.hairColor ? (
                        <p className="-mt-1 text-sm font-medium text-red-500">
                          {formState.errors.hairColor.message}
                        </p>
                      ) : null}
                    </fieldset>
                    <fieldset className="grid w-full gap-2.5">
                      <label
                        htmlFor="smile"
                        className="text-sm font-medium text-gray-50 sm:text-base"
                      >
                        Choose smile
                      </label>
                      <DropdownSelect
                        control={control}
                        name="smile"
                        options={Object.values(SMILE)}
                      />
                      {formState.errors.smile ? (
                        <p className="-mt-1 text-sm font-medium text-red-500">
                          {formState.errors.smile.message}
                        </p>
                      ) : null}
                    </fieldset>
                    <fieldset className="grid w-full gap-2.5">
                      <label
                        htmlFor="cosmetic"
                        className="text-sm font-medium text-gray-50 sm:text-base"
                      >
                        Choose cosmetics{" "}
                        <span className="text-gray-400">(max 3)</span>
                      </label>
                      <DropdownSelect
                        control={control}
                        name="cosmetics"
                        options={Object.values(COSMETICS)}
                        isMultiple={true}
                        maxSelected={3}
                      />
                      {formState.errors.cosmetics ? (
                        <p className="-mt-1 text-sm font-medium text-red-500">
                          {formState.errors.cosmetics.message}
                        </p>
                      ) : null}
                    </fieldset>
                  </div>
                ) : null}
              </div>
              <fieldset className="mt-6 grid w-full gap-2.5">
                <label
                  htmlFor="addOns"
                  className="text-sm font-medium text-gray-50 sm:text-base"
                >
                  Choose aditional features{" "}
                  <span className="text-gray-400">(max 1)</span>
                </label>
                <Accordion
                  buttonLabel="Aditional features"
                  panelContent={
                    <Fragment>
                      <fieldset className="grid w-full gap-2.5">
                        <label htmlFor="restored" className="sr-only">
                          Restore photo
                        </label>
                        <ToggleInput
                          control={control}
                          name="restored"
                          label="Restore photo"
                          description="Old and blurry face photo restoration"
                          disabled={watch("bgRemoved") === true}
                        />
                        {formState.errors.restored ? (
                          <p className="-mt-1 text-sm font-medium text-red-500">
                            {formState.errors.restored.message}
                          </p>
                        ) : null}
                      </fieldset>
                      <fieldset className="grid w-full gap-2.5">
                        <label htmlFor="bgRemoved" className="sr-only">
                          Remove background
                        </label>
                        <ToggleInput
                          control={control}
                          name="bgRemoved"
                          label="Remove background"
                          description="Face photo background removal"
                          disabled={watch("restored") === true}
                        />
                        {formState.errors.bgRemoved ? (
                          <p className="-mt-1 text-sm font-medium text-red-500">
                            {formState.errors.bgRemoved.message}
                          </p>
                        ) : null}
                      </fieldset>
                    </Fragment>
                  }
                />
              </fieldset>
              <fieldset className="mt-6 grid w-full gap-3">
                <label
                  htmlFor="image"
                  className="flex items-center justify-between gap-2 text-sm font-medium text-gray-50 sm:text-base"
                >
                  <span className="flex-1">Upload your image</span>
                  {selectedFile ? (
                    <CropModal
                      isOpen={isCropperOpen}
                      setIsOpen={setIsCropperOpen}
                      selectedFile={selectedFile}
                      setCropData={setCropData}
                    />
                  ) : null}
                </label>
                <FileInput
                  name="image"
                  setValue={setValue}
                  maxSize={10 * 1024 * 1024}
                  selectedFile={selectedFile}
                  setSelectedFile={setSelectedFile}
                  cropData={cropData}
                  setCropData={setCropData}
                  disabled={isLoading}
                />
                {formState.errors.image?.message ? (
                  <p className="-mt-1 text-sm font-medium text-red-500">
                    {formState.errors.image.message}
                  </p>
                ) : null}
              </fieldset>
              <Button
                aria-label="Edit photo"
                className="mt-7 w-full"
                isLoading={isLoading}
                loadingVariant="dots"
                disabled={isLoading}
              >
                Edit photo
              </Button>
            </form>
          )}
        </div>
      </main>
    </>
  );
};

export default Home;

Home.getLayout = (page) => <DefaultLayout>{page}</DefaultLayout>;
