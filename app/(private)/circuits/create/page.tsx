import { AutoComplete } from "@/components/shared/autocomplete";
import PageWrapper from "@/components/shared/page-wrapper";
import React from "react";

const page = () => {
  return (
    <PageWrapper>
      <AutoComplete
        emptyMessage="no allowed"
        options={[{ label: "ayoub", value: "ayoub" }]}
      />
    </PageWrapper>
  );
};

export default page;
