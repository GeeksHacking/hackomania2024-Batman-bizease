import React from "react";
import FileUpload from "@/components/FileUpload";
import ContentUrlUpload from "@/components/ContentUrlUpload";

const Page = () => {
  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <h1 className="text-4xl font-bold my-4">Add to the pool of information</h1>
      <FileUpload />
      <h4 className="text-center text-2xl">OR</h4>
      <ContentUrlUpload />
    </div>
  )
}

export default Page;