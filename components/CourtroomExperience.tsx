"use client";

import { useState } from "react";
import LocationSelector, { type LocationSelection } from "./LocationSelector";
import ChatInput from "./ChatInput";

export default function CourtroomExperience() {
  const [selection, setSelection] = useState<LocationSelection>({
    location: null,
    representative: null,
  });

  return (
    <div className="flex flex-col gap-8">
      <LocationSelector onChange={setSelection} />
      <ChatInput selection={selection} />
    </div>
  );
}
