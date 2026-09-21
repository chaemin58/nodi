"use client";

import { useState } from "react";
import { Button } from "../Button/Button";
import { CreateMeetupModal } from "./CreateMeetupModal";

interface CreateMeetupButtonProps {
  groupId: string;
}

export function CreateMeetupButton({ groupId }: CreateMeetupButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button size="md" onClick={() => setIsOpen(true)}>
        약속 추가하기
      </Button>
      {isOpen && <CreateMeetupModal onClose={() => setIsOpen(false)} groupId={groupId} />}
    </>
  );
}
