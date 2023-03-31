import Button from "@/components/ui/Button";
import type { SetState } from "@/types/globals";
import { Dialog, Transition } from "@headlessui/react";
import "cropperjs/dist/cropper.css";
import { Crop, RotateCcw, X } from "lucide-react";
import { Fragment, useRef } from "react";
import Cropper, { type ReactCropperElement } from "react-cropper";

type CropModalProps = {
  isOpen: boolean;
  setIsOpen: SetState<boolean>;
  selectedFile: File | null;
  setCropData: SetState<string | null>;
};

const CropModal = ({
  isOpen,
  setIsOpen,
  selectedFile,
  setCropData,
}: CropModalProps) => {
  const cropperRef = useRef<ReactCropperElement>(null);

  return (
    <>
      <Button
        aria-label="open image cropper modal"
        type="button"
        variant="gray"
        className="flex h-auto w-fit items-center gap-2 px-3 py-1.5 font-normal active:scale-95"
        onClick={() => setIsOpen(true)}
      >
        <Crop className="h-4 w-4" aria-hidden="true" />
        <span>Crop image</span>
      </Button>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-20"
          onClose={() => setIsOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/70" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="grid h-full w-full max-w-2xl transform place-items-center gap-4 overflow-hidden rounded-lg bg-gray-800 p-5 text-left align-middle shadow-xl transition-all">
                  <div className="flex w-full justify-between gap-2">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-50"
                    >
                      Crop image
                    </Dialog.Title>
                    <Button
                      aria-label="close image cropper modal"
                      type="button"
                      variant="gray"
                      className="flex h-auto w-fit items-center gap-2 rounded-full p-2 active:scale-95"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                  {selectedFile ? (
                    <div className="grid gap-5">
                      <Cropper
                        ref={cropperRef}
                        className="h-full w-full object-cover"
                        zoomTo={0.5}
                        initialAspectRatio={1}
                        preview=".img-preview"
                        src={URL.createObjectURL(selectedFile)}
                        viewMode={1}
                        minCropBoxHeight={10}
                        minCropBoxWidth={10}
                        background={false}
                        responsive={true}
                        autoCropArea={1}
                        checkOrientation={false} // https://github.com/fengyuanchen/cropperjs/issues/671
                        guides={true}
                      />
                      <div className="flex items-center justify-center gap-2.5">
                        <Button
                          aria-label="crop image"
                          type="button"
                          variant="gray"
                          className="flex h-auto w-fit items-center gap-2 text-sm active:scale-95 sm:text-base"
                          onClick={() => {
                            if (!selectedFile || !cropperRef.current) return;
                            setCropData(
                              cropperRef.current?.cropper
                                .getCroppedCanvas()
                                .toDataURL()
                            );
                            setIsOpen(false);
                          }}
                        >
                          <Crop className="h-4 w-4" aria-hidden="true" />
                          <span>Crop image</span>
                        </Button>
                        <Button
                          aria-label="reset crop"
                          type="button"
                          variant="gray"
                          className="flex h-auto w-fit items-center gap-2 text-sm active:scale-95 sm:text-base"
                          onClick={() => {
                            cropperRef.current?.cropper.reset();
                            setCropData(null);
                          }}
                        >
                          <RotateCcw className="h-4 w-4" aria-hidden="true" />
                          <span>Reset crop</span>
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default CropModal;
