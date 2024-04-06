"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import React from "react";
import toast from "react-hot-toast";

const ContentUrlUpload = () => {
  const [url, setUrl] = React.useState('');
  const [uploading, setUploading] = React.useState(false);
  
  const { mutate, isPending } = useMutation({
    mutationFn: async(contentUrl: string) => {
      const response = await fetch("/api/upload-url", {
        method: "POST",
        body: JSON.stringify({ url: contentUrl }),
      })
      return response.json();
    }
  })

  const handleChange = (event:React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      try {
        setUploading(true);
        mutate(url, {
          onSuccess: ({ file_key }) => {
            toast.success(`Url uploaded as ${file_key}`);
          },
          onError: (err) => {
            toast.error("Error parsing url");
            console.error(err);
          },
        })
      } catch (err) {
        console.error(err)
      } finally {
        setUploading(false);
      }
    }}>
      <label htmlFor="urlInput">Content URL</label><br />
      <div className="flex gap-2">
        <Input
          type="url"
          id="contentUrl"
          name="contentUrl"
          value={url}
          onChange={handleChange}
          required
        />
        <Button type="submit" value="Submit">
          {uploading || isPending ? (
            <>
              {/* loading state */}
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            </>
          ) : (
            <>
              Submit
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

export default ContentUrlUpload