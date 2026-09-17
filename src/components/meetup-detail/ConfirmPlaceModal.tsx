"use client";

import { Modal } from "../modal/Modal";
import { ModalBody } from "../modal/ModalBody";
import { ModalHeader } from "../modal/ModalHeader";
import { confirmCourse, setMeetupStatus, type PlaceWithProfile } from "@/api";
import { PlaceCard } from "./PlaceCard";
import { useState } from "react";
import { Button } from "../Button/Button";
import { ModalFooter } from "../modal/ModalFooter";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface ConfirmPlaceModalProps {
  meetupId: string;
  places: PlaceWithProfile[];
  onClose: () => void;
  votedCount: Record<string, number>;
}
export function ConfirmPlaceModal({
  onClose,
  meetupId,
  places,
  votedCount,
}: ConfirmPlaceModalProps) {
  const [step, setStep] = useState<"first" | "second">("first");
  const [selectdList, setSelectedList] = useState<PlaceWithProfile[]>([]);
  const [isNotSelected, setIsNotSelected] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleToggle = (place: PlaceWithProfile) => {
    setSelectedList((prev) =>
      //이전의 값이 place를 가지고 있으면 빼주고 아니면 추가해준다.
      prev.some((p) => p.id === place.id)
        ? prev.filter((p) => p.id !== place.id)
        : [...prev, place],
    );
  };

  const handleClickConfirm = (selectdList: PlaceWithProfile[]) => {
    if (selectdList.length === 0) {
      setIsNotSelected(true);
    } else {
      setStep("second");
    }
  };

  const handleClickSubmit = async () => {
    const supabase = createClient();
    const orderedPlaceIds = selectdList.map((place) => place.id);
    try {
      setIsSubmitting(true);
      await confirmCourse(supabase, meetupId, orderedPlaceIds);
      await setMeetupStatus(supabase, meetupId, "confirmed");
      router.refresh();
      onClose();
    } catch (error) {
      console.error("장소 확정 오류", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === "first") {
    return (
      <Modal onClose={onClose} isDismissable>
        <ModalHeader className="font-bold md:text-lg">장소 결정하기</ModalHeader>
        <ModalBody className="gap-2 p-4">
          {places.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              isSelected={selectdList.some((p) => p.id === place.id)}
              onToggle={() => handleToggle(place)}
              isUserVoted={false}
              isVotedCard={false}
              votedCount={votedCount[place.id]}
            />
          ))}
        </ModalBody>
        <ModalFooter className="flex flex-col gap-2 p-4 pt-2">
          {isNotSelected && <div className="text-error text-sm">원하는 장소를 선택해주세요!!</div>}
          <Button onClick={() => handleClickConfirm(selectdList)}>결정하기</Button>
        </ModalFooter>
      </Modal>
    );
  } else {
    return (
      <Modal onClose={onClose} isDismissable>
        <ModalBody className="items-center p-6 text-center">
          <div className="font-semibold md:text-lg">정말 확정하시겠습니까?</div>
          <div className="text-text-secondary text-sm">
            {selectdList.map((selected) => selected.name).join(", ")}
          </div>
        </ModalBody>
        <ModalFooter className="grid grid-cols-2 gap-2 p-4 pt-0">
          <Button size="sm" variant="secondary" onClick={() => setStep("first")}>
            취소
          </Button>
          <Button size="sm" onClick={handleClickSubmit} disabled={isSubmitting}>
            확정
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}
