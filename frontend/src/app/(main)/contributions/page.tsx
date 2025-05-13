"use client";
import { useToast } from "@/hooks/use-toast";
import { UploadButton } from "@/utils/uploadthing";
import Image from "next/image";

const Contributions = () => {
  const { toast } = useToast();
  return (
    <section className="flex flex-col items-center justify-center mt-12">
      <h1 className="font-semibold text-2xl text-center mb-5">
        Contribute to our dataset and help us drive better <br /> insights,
        research, and innovation.
      </h1>

      <Image
        src="/upload.png"
        alt="upload"
        height={80}
        width={80}
      />
      <UploadButton
        endpoint="imageUploader"
        onClientUploadComplete={(res) => {
          toast({
            title: "File Uploaded Successfully!",
          });
        }}
        onUploadError={(error: Error) => {
          toast({
            title: "Error uploading file",
            description: "Please try again",
          });
        }}
        className="mt-6"
      />
    </section>
  );
};

export default Contributions;
