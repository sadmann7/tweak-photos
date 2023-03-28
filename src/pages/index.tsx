import CompareSlider from "@/components/CompareSlider";
import { Icons } from "@/components/Icons";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import Button from "@/components/ui/Button";
import DropdownSelect from "@/components/ui/DropdownSelect";
import FileInput from "@/components/ui/FileInput";
import Toggle from "@/components/ui/Toggle";
import type { NextPageWithLayout } from "@/pages/_app";
import type {
  OriginalImage,
  ResponseData,
  UploadedFile,
} from "@/types/globals";
import {
  ACCESSORY,
  EMOTION,
  GENDER,
  HAIR_STYLE,
  SKIN_TONE,
} from "@/types/globals";
import { downloadFile } from "@/utils/download";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Download, Loader2, Tv2, Upload } from "lucide-react";
import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "react-hot-toast";
import { z } from "zod";

const schema = z.object({
  image: z.unknown().refine((v) => v instanceof File, {
    message: "Upload an image",
  }),
  skinTone: z.nativeEnum(SKIN_TONE).default(SKIN_TONE.DEFAULT),
  hairStyle: z.nativeEnum(HAIR_STYLE).default(HAIR_STYLE.DEFAULT),
  emotion: z.nativeEnum(EMOTION).default(EMOTION.HAPPY),
  gender: z.nativeEnum(GENDER).default(GENDER.DEFAULT),
  accessory: z.nativeEnum(ACCESSORY).default(ACCESSORY.DEFAULT),
});
type TInputs = z.infer<typeof schema>;

const Home: NextPageWithLayout = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<OriginalImage | null>(
    null
  );
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // react-hook-form
  const { handleSubmit, formState, control, setValue, reset } =
    useForm<TInputs>({
      resolver: zodResolver(schema),
    });
  const onSubmit: SubmitHandler<TInputs> = async (data) => {
    console.log(data);
    if (!(data.image instanceof File)) return;
    await uploadImage(
      data.image,
      data.skinTone,
      data.hairStyle,
      data.emotion,
      data.gender
    );
  };

  // upload image to cloudinary
  const uploadImage = async (
    image: File,
    skinTone: SKIN_TONE,
    hairStyle: HAIR_STYLE,
    emotion: EMOTION,
    gender: GENDER
  ) => {
    setIsLoading(true);
    const reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onload = async () => {
      const base64 = reader.result;
      if (typeof base64 !== "string") return;
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          base64,
        }),
      });

      if (response.status !== 200) {
        toast.error("Something went wrong");
        setIsLoading(false);
      } else {
        const uploadedFile = (await response.json()) as UploadedFile;
        if (!uploadedFile) return;
        setOriginalImage({
          name: image.name,
          url: uploadedFile.secureUrl,
        });
        setIsLoading(true);
        await generateImage(
          uploadedFile.secureUrl,
          skinTone,
          hairStyle,
          emotion,
          gender
        );
      }
    };
    await new Promise((resolve) => setTimeout(resolve, 200));
  };

  // generate image from replicate
  const generateImage = async (
    image: string,
    skinTone: SKIN_TONE,
    hairStyle: HAIR_STYLE,
    emotion: EMOTION,
    gender: GENDER
  ) => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    setIsLoading(true);
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image,
        skinTone,
        hairStyle,
        emotion,
        gender,
      }),
    });

    const response = (await res.json()) as ResponseData;
    if (res.status !== 200) {
      response instanceof Object
        ? setError(response.output)
        : setError(response);
      setIsLoading(false);
    } else {
      setGeneratedImage(response.output);
    }

    setTimeout(() => {
      setIsLoading(false);
    }, 1300);
  };

  console.log({
    originalImage,
    generatedImage,
  });

  return (
    <>
      <Head>
        <title>TweakPhotos</title>
      </Head>
      <main className="w-full pt-40 pb-32 sm:pt-32">
        <div className="container grid max-w-5xl place-items-center gap-12 sm:gap-14">
          <div className="grid w-full  max-w-4xl place-items-center gap-5">
            <h1 className="text-center text-4xl font-bold leading-tight text-gray-200 sm:text-6xl sm:leading-tight">
              Edit your face photos using AI
            </h1>
            <p className="text-center text-lg text-gray-400 sm:text-xl">
              Upload only face photos for better results
            </p>
            <div className="flex w-full items-center justify-center gap-3">
              <a
                aria-label="navigate to github repo"
                href="https://github.com/sadmann7/npm-picker"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-md border border-gray-700 bg-transparent px-4 py-2 text-gray-50 transition-colors hover:bg-gray-800 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-800 active:scale-95 xxs:w-fit xxs:px-4"
              >
                <Icons.gitHub className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only text-xs font-medium xxs:not-sr-only sm:text-sm">
                  Star on Github
                </span>
              </a>
              <Button
                aria-label="watch demo"
                variant="ghost"
                className="h-auto w-fit gap-2 border border-gray-700 px-4 py-2 active:scale-95"
              >
                <Tv2 className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only text-xs font-medium xxs:not-sr-only sm:text-sm">
                  Watch demo
                </span>
              </Button>
            </div>
          </div>
          {isLoading ? (
            <div className="grid w-full place-items-center">
              <h2 className="text-lg font-medium text-gray-50 sm:text-xl">
                Generating pokemon...
              </h2>
              <p className="mt-2 text-sm text-gray-400 sm:text-base">
                This usually takes around 30 to 40 seconds
              </p>
            </div>
          ) : error ? (
            <div role="alert" className="grid w-full place-items-center gap-5">
              <AlertTriangle
                className="h-24 w-24 animate-pulse text-red-500"
                aria-hidden="true"
              />
              <h2 className="text-lg font-medium text-gray-50 sm:text-xl">
                Something went wrong
              </h2>
              <p className="text-sm text-gray-400 sm:text-base">{error}</p>
              <Button
                aria-label="Try again"
                className="w-fit"
                onClick={() => {
                  setError(null);
                  setOriginalImage(null);
                  setGeneratedImage(null);
                  setSelectedFile(null);
                  reset();
                }}
              >
                Try again
              </Button>
            </div>
          ) : originalImage && generatedImage ? (
            <div className="grid w-full place-items-center gap-8">
              <Toggle
                enabled={isComparing}
                setEnabled={setIsComparing}
                enabledLabel="Compare"
                disabledLabel="Side by side"
              />
              {isComparing ? (
                <CompareSlider
                  itemOneName={originalImage.name ?? "original"}
                  itemOneUrl={originalImage.url}
                  itemTwoName="Generated pokemon"
                  itemTwoUrl={generatedImage}
                  className="aspect-square max-h-[480px] rounded-xl"
                />
              ) : (
                <div className="flex w-full flex-col items-center gap-6 sm:flex-row sm:gap-4">
                  <div className="grid w-full place-items-center gap-2 sm:w-1/2">
                    <h2 className="text-base font-medium text-gray-50 sm:text-lg">
                      Original image
                    </h2>
                    <Image
                      src={originalImage.url}
                      alt={originalImage.name ?? "original"}
                      width={480}
                      height={480}
                      className="rounded-xl"
                      priority
                    />
                  </div>
                  <div className="grid w-full place-items-center gap-2 sm:w-1/2">
                    <h2 className="text-base font-medium text-gray-50 sm:text-lg">
                      Generated pokemon
                    </h2>
                    <Image
                      src={generatedImage}
                      alt={"Generated pokemon"}
                      width={480}
                      height={480}
                      className="rounded-xl"
                      priority
                    />
                  </div>
                </div>
              )}
              <div className="flex w-full max-w-sm flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  aria-label="Generate another pokemon"
                  className="w-full gap-2 text-sm sm:text-base"
                  onClick={() => {
                    setOriginalImage(null);
                    setGeneratedImage(null);
                    setError(null);
                    setSelectedFile(null);
                    reset();
                  }}
                >
                  <Upload className="h-4 w-4 stroke-2" aria-hidden="true" />
                  <span className="whitespace-nowrap">Generate again</span>
                </Button>
                <Button
                  aria-label="Download generated pokemon"
                  variant="secondary"
                  className="w-full gap-2 text-sm sm:text-base"
                  onClick={() => {
                    downloadFile(
                      generatedImage,
                      "generated-pokemon.png",
                      setIsDownloading
                    );
                  }}
                >
                  {isDownloading ? (
                    <Loader2
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <Download className="h-4 w-4" aria-hidden="true" />
                  )}
                  <span className="whitespace-nowrap">Download pokemon</span>
                </Button>
              </div>
            </div>
          ) : (
            <form
              aria-label="Generate pokemon form"
              className="grid w-full max-w-lg place-items-center gap-8"
              onSubmit={(...args) => void handleSubmit(onSubmit)(...args)}
            >
              <fieldset className="grid w-full gap-4">
                <label
                  htmlFor="skinTone"
                  className="flex items-center gap-2.5 text-sm font-medium  sm:text-base"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-gray-50 text-base font-bold text-gray-900 sm:text-lg">
                    1
                  </span>
                  <span className="flex-1 text-gray-50">Choose skin tone</span>
                </label>
                <DropdownSelect
                  control={control}
                  name="skinTone"
                  options={Object.values(SKIN_TONE)}
                />
                {formState.errors.skinTone ? (
                  <p className="-mt-1 text-sm font-medium text-red-500">
                    {formState.errors.skinTone.message}
                  </p>
                ) : null}
              </fieldset>
              <fieldset className="grid w-full gap-4">
                <label
                  htmlFor="hairStyle"
                  className="flex items-center gap-2.5 text-sm font-medium  sm:text-base"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-gray-50 text-base font-bold text-gray-900 sm:text-lg">
                    2
                  </span>
                  <span className="flex-1 text-gray-50">Choose hair style</span>
                </label>
                <DropdownSelect
                  control={control}
                  name="hairStyle"
                  options={Object.values(HAIR_STYLE)}
                />
                {formState.errors.hairStyle ? (
                  <p className="-mt-1 text-sm font-medium text-red-500">
                    {formState.errors.hairStyle.message}
                  </p>
                ) : null}
              </fieldset>
              <fieldset className="grid w-full gap-4">
                <label
                  htmlFor="emotion"
                  className="flex items-center gap-2.5 text-sm font-medium  sm:text-base"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-gray-50 text-base font-bold text-gray-900 sm:text-lg">
                    4
                  </span>
                  <span className="flex-1 text-gray-50">Choose emotion</span>
                </label>
                <DropdownSelect
                  control={control}
                  name="emotion"
                  options={Object.values(EMOTION)}
                />
                {formState.errors.emotion ? (
                  <p className="-mt-1 text-sm font-medium text-red-500">
                    {formState.errors.emotion.message}
                  </p>
                ) : null}
              </fieldset>
              <fieldset className="grid w-full gap-4">
                <label
                  htmlFor="gender"
                  className="flex items-center gap-2.5 text-sm font-medium  sm:text-base"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-gray-50 text-base font-bold text-gray-900 sm:text-lg">
                    5
                  </span>
                  <span className="flex-1 text-gray-50">Choose gender</span>
                </label>
                <DropdownSelect
                  control={control}
                  name="gender"
                  options={Object.values(GENDER)}
                />
                {formState.errors.gender ? (
                  <p className="-mt-1 text-sm font-medium text-red-500">
                    {formState.errors.gender.message}
                  </p>
                ) : null}
              </fieldset>
              <fieldset className="grid w-full gap-4">
                <label
                  htmlFor="image"
                  className="flex items-center gap-2.5 text-sm font-medium sm:text-base"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-gray-50 text-base font-bold text-gray-900 sm:text-lg">
                    6
                  </span>
                  <span className="flex-1 text-gray-50">Upload your image</span>
                </label>
                <FileInput
                  name="image"
                  setValue={setValue}
                  maxSize={10 * 1024 * 1024}
                  selectedFile={selectedFile}
                  setSelectedFile={setSelectedFile}
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
                className="w-full"
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
