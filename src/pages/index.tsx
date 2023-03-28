import CompareSlider from "@/components/CompareSlider";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import Button from "@/components/ui/Button";
import FileInput from "@/components/ui/FileInput";
import Toggle from "@/components/ui/Toggle";
import type { NextPageWithLayout } from "@/pages/_app";
import type {
  OriginalImage,
  ResponseData,
  UploadedFile,
} from "@/types/globals";
import { downloadFile } from "@/utils/download";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Download, Loader2, Upload } from "lucide-react";
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
});
type Inputs = z.infer<typeof schema>;

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
  const { handleSubmit, formState, setValue, reset } = useForm<Inputs>({
    resolver: zodResolver(schema),
  });
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    console.log(data);
    if (!(data.image instanceof File)) return;
    await uploadImage(data.image);
  };

  // upload image to cloudinary
  const uploadImage = async (image: File) => {
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
        await generateImage(uploadedFile.secureUrl);
      }
    };
    await new Promise((resolve) => setTimeout(resolve, 200));
  };

  // generate image from replicate
  const generateImage = async (imageUrl: string) => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    setIsLoading(true);
    const res = await fetch("/api/generatePrompt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageUrl }),
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

  return (
    <>
      <Head>
        <title>TweakPhotos</title>
      </Head>
      <main className="w-full pt-40 pb-32 sm:pt-32">
        <div className="container grid max-w-5xl place-items-center gap-12 sm:gap-14">
          <div className="grid max-w-4xl place-items-center gap-5">
            <h1 className="w-full text-center text-4xl font-bold leading-tight text-gray-200 sm:text-6xl sm:leading-tight">
              Generating <span className="text-blue-500">pokemons</span> from
              your images using AI
            </h1>
            <p className="w-full text-center text-lg text-gray-400 sm:text-xl">
              Upload your image and get a pokemon generated from it
            </p>
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
              <fieldset className="grid w-full gap-5">
                <label htmlFor="image" className="sr-only">
                  Upload your image
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
                  <p className="text-sm font-medium text-red-500">
                    {formState.errors.image.message}
                  </p>
                ) : null}
              </fieldset>
              <Button
                aria-label="Generate pokemon"
                className="w-fit"
                isLoading={isLoading}
                loadingVariant="dots"
                disabled={isLoading}
              >
                Generate pokemon
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
