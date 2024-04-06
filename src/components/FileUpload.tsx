"use client";

import React from "react";
import toast from 'react-hot-toast';
import { useDropzone } from "react-dropzone";
import { useMutation } from "@tanstack/react-query";
import { Inbox, Loader2 } from "lucide-react";

const FileUpload = () => {
  const initialState = {
    sentiment: "", 
    message: ""
  };
  const [uploading, setUploading] = React.useState(false);
  
  const { mutate, isPending } = useMutation({
    mutationFn: async(file: File) => {
      const data = new FormData()
      data.append('file', file)
      
      const response = await fetch("/api/upload-document", {
        method: "POST",
        body: data,
      })
      return response.json()
    }
  })

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      // larger than 10mb
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File too large");
        return;
      }

      try {
        setUploading(true);
        mutate(file, {
          onSuccess: ({ file_key }) => {
            toast.success(`File uploaded as ${file_key}`);
          },
          onError: (err) => {
            toast.error("Error uploading file");
            console.error(err);
          },
        });
      } catch (error) {
        console.log(error);
      } finally {
        setUploading(false);
      }
    },
  });

  return (
    <div className="p-2 bg-white rounded-xl">
      <div
        {...getRootProps({
          className:
            "border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col",
        })}
      >
        <input {...getInputProps()} />
        {uploading || isPending ? (
          <>
            {/* loading state */}
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            <p className="mt-2 text-sm text-slate-400">
              Uploading to Vector DB
            </p>
          </>
        ) : (
          <>
            <Inbox className="w-10 h-10 text-blue-500" />
            <p className="mt-2 text-sm text-slate-400">Drop PDF Here</p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;