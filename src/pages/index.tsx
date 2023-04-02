import CompareSlider from "@/components/CompareSlider";
import CropModal from "@/components/CropModal";
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
  HAIR_STYLE,
  PRESET,
  SMILE,
  type OriginalImage,
  type ResponseData,
  type UploadedFile,
} from "@/types/globals";
import { api } from "@/utils/api";
import { downloadFile } from "@/utils/download";
import { hexToHairColor } from "@/utils/format";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { zodResolver } from "@hookform/resolvers/zod";
import "cropperjs/dist/cropper.css";
import { AlertTriangle, Download, Loader2, Upload } from "lucide-react";
import Head from "next/head";
import Image from "next/image";
import { Fragment, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "react-hot-toast";
import { z } from "zod";

const schema = z.object({
  image: z.unknown().refine((v) => v instanceof File, {
    message: "Upload an image",
  }),
  preset: z.nativeEnum(PRESET).default(PRESET.NO_PRESET),
  hairStyle: z.nativeEnum(HAIR_STYLE).default(HAIR_STYLE.DEFAULT),
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
  const [isComparing, setIsComparing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // create photo mutation
  const createPhotoMutation = api.photos.create.useMutation({
    onSuccess: (data) => {
      console.log(data);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

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
          if (!watch("restored") && !watch("bgRemoved")) {
            await createPhotoMutation.mutateAsync({
              editedId: editResponse2.id,
              editedImage: editResponse2.output ?? "",
              inputImage: uploadedFile.secureUrl,
              prompt: editResponse2.prompt ?? "",
            });
          }

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

          setTimeout(() => {
            setIsLoading(false);
          }, 8000);
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

  // moch image generation
  const mochGenerateImage = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 200));
    setOriginalImage({
      name: "original.jpg",
      url: "https://res.cloudinary.com/dasxoa9r4/image/upload/v1680363491/tweak-photos/hzi5gdtovf7fyq0dyfll.jpg",
    });
    setGeneratedImage(
      "https://res.cloudinary.com/dasxoa9r4/image/upload/v1680363491/tweak-photos/hzi5gdtovf7fyq0dyfll.jpg"
    );
    setFinalImage(
      "https://res.cloudinary.com/dasxoa9r4/image/upload/v1680363491/tweak-photos/hzi5gdtovf7fyq0dyfll.jpg"
    );

    setTimeout(() => {
      setIsLoading(false);
    }, 7000);
  };

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
          <Button
            aria-label="moch generate image"
            variant="ghost"
            className="h-auto w-fit gap-2 border border-gray-700 px-4 py-2.5 active:scale-95"
            onClick={() => void mochGenerateImage()}
          >
            Moch generate image
          </Button>
          {isLoading ? (
            <div className="grid w-full place-items-center">
              <h2 className="text-lg font-medium text-gray-50 sm:text-xl">
                Generating image...
              </h2>
              <p className="mt-2 text-sm text-gray-400 sm:text-base">
                Sit back and relax, this usually takes 15-20 seconds
              </p>
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
                  itemTwoName="Generated"
                  itemTwoUrl={finalImage ?? generatedImage}
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
                      Generated image
                    </h2>
                    <Image
                      src={finalImage ?? generatedImage}
                      alt={"Generated"}
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
                    setIsComparing(false);
                    setError(null);
                    setIsDownloading(false);
                    reset();
                  }}
                >
                  <Upload className="h-4 w-4 stroke-2" aria-hidden="true" />
                  <span className="whitespace-nowrap">Generate again</span>
                </Button>
                <Button
                  aria-label="Download generated image"
                  variant="white"
                  className="w-full gap-2 text-sm sm:text-base"
                  onClick={() => {
                    downloadFile(generatedImage, "generated-image.webp");
                    setIsDownloading(true);
                    setTimeout(() => {
                      setIsDownloading(false);
                    }, 1000);
                  }}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <Loader2
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <Download className="h-4 w-4" aria-hidden="true" />
                  )}
                  <span className="whitespace-nowrap">Download image</span>
                </Button>
              </div>
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
                    <div className="flex w-full flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                      <fieldset className="grid w-full gap-2.5">
                        <label
                          htmlFor="hairStyle"
                          className="text-sm font-medium text-gray-50 sm:text-base"
                        >
                          Choose hair style
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
                    </div>
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
                  htmlFor="aditionalFeatures"
                  className="text-sm font-medium text-gray-50 sm:text-base"
                >
                  Toggle aditional features{" "}
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
